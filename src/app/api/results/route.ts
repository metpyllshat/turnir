import { db } from "@/db";
import { players, disciplines, results, updateLog } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

// POST – bot submits a result
// Body: { secret, discord_id, player_name, avatar_url?, discipline_slug, place, participants_count }
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
      participants_count,
    } = body;

    // Simple shared-secret auth
    const expectedSecret = process.env.BOT_SECRET || "koryazhma-secret-2026";
    if (secret !== expectedSecret) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!discord_id || !player_name || !discipline_slug || !place || !participants_count) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Upsert player
    const existingPlayer = await db
      .select()
      .from(players)
      .where(eq(players.discordId, discord_id))
      .limit(1);

    let playerId: number;
    if (existingPlayer.length > 0) {
      playerId = existingPlayer[0].id;
      // Update name/avatar if changed
      await db
        .update(players)
        .set({ name: player_name, avatarUrl: avatar_url || null })
        .where(eq(players.id, playerId));
    } else {
      const [newPlayer] = await db
        .insert(players)
        .values({
          discordId: discord_id,
          name: player_name,
          avatarUrl: avatar_url || null,
        })
        .returning();
      playerId = newPlayer.id;
    }

    // Make sure discipline exists
    const existingDiscipline = await db
      .select()
      .from(disciplines)
      .where(eq(disciplines.slug, discipline_slug))
      .limit(1);

    if (existingDiscipline.length === 0) {
      return Response.json(
        { error: `Discipline '${discipline_slug}' not found` },
        { status: 404 }
      );
    }
    const disciplineId = existingDiscipline[0].id;

    // Calculate score: more participants = more points. Score = participants - place + 1
    const score = Math.max(participants_count - place + 1, 0);

    // Upsert result
    const existingResult = await db
      .select()
      .from(results)
      .where(
        and(
          eq(results.playerId, playerId),
          eq(results.disciplineId, disciplineId)
        )
      )
      .limit(1);

    if (existingResult.length > 0) {
      await db
        .update(results)
        .set({ place, score })
        .where(eq(results.id, existingResult[0].id));
    } else {
      await db.insert(results).values({
        playerId,
        disciplineId,
        place,
        score,
      });
    }

    // Log update
    await db.insert(updateLog).values({});

    return Response.json({ ok: true, playerId, disciplineId, score });
  } catch (err: unknown) {
    console.error("POST /api/results error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}
