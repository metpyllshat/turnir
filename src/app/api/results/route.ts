import { db } from "@/db";
import { players, disciplines, results, updateLog } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      secret,
      discord_id,
      player_name,
      avatar_url,
      discipline_slug,
      place,
    } = body;

    const expectedSecret = process.env.BOT_SECRET || "koryazhma-secret-2026";
    if (secret !== expectedSecret) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!discord_id || !player_name || !discipline_slug || !place) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. Upsert игрока
    const existingPlayer = await db
      .select()
      .from(players)
      .where(eq(players.discordId, discord_id))
      .limit(1);

    let playerId: number;
    if (existingPlayer.length > 0) {
      playerId = existingPlayer[0].id;
      await db
        .update(players)
        .set({ name: player_name, avatarUrl: avatar_url || null })
        .where(eq(players.id, playerId));
    } else {
      const [newPlayer] = await db
        .insert(players)
        .values({ discordId: discord_id, name: player_name, avatarUrl: avatar_url || null })
        .returning();
      playerId = newPlayer.id;
    }

    // 2. Найти дисциплину
    const existingDiscipline = await db
      .select()
      .from(disciplines)
      .where(eq(disciplines.slug, discipline_slug))
      .limit(1);

    if (existingDiscipline.length === 0) {
      return Response.json({ error: `Discipline '${discipline_slug}' not found` }, { status: 404 });
    }
    const disciplineId = existingDiscipline[0].id;

    // 3. Получить все текущие результаты по этой дисциплине
    const currentResults = await db
      .select()
      .from(results)
      .where(eq(results.disciplineId, disciplineId));

    // Новый игрок или обновление?
    const isNewParticipant = !currentResults.find(r => r.playerId === playerId);
    const totalParticipants = currentResults.length + (isNewParticipant ? 1 : 0);

    // 4. Пересчитать очки всем существующим участникам
    // (потому что общий пул вырос)
    for (const result of currentResults) {
      if (result.playerId !== playerId) {
        const recalcScore = Math.round(
          (Math.sqrt(10 * totalParticipants) * (totalParticipants - result.place + 1) / totalParticipants) * 10
        ) / 10;
        await db
          .update(results)
          .set({ score: recalcScore })
          .where(eq(results.id, result.id));
      }
    }

    // 5. Очки для нового/обновляемого результата
    const score = Math.round(
      (Math.sqrt(10 * totalParticipants) * (totalParticipants - place + 1) / totalParticipants) * 10
    ) / 10;

    // 6. Upsert результат
    const existingResult = currentResults.find(r => r.playerId === playerId);
    if (existingResult) {
      await db
        .update(results)
        .set({ place, score })
        .where(eq(results.id, existingResult.id));
    } else {
      await db.insert(results).values({ playerId, disciplineId, place, score });
    }

    // 7. Лог обновления (для real-time)
    await db.insert(updateLog).values({});

    return Response.json({
      ok: true,
      playerId,
      disciplineId,
      score,
      totalParticipants,
      message: `${player_name} — ${place} место, +${score} очков (всего участников: ${totalParticipants})`,
    });

  } catch (err: unknown) {
    console.error("POST /api/results error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}