import { db } from "@/db";
import { players, results, disciplines } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const playerId = parseInt(id);
    if (isNaN(playerId)) {
      return Response.json({ error: "Invalid player id" }, { status: 400 });
    }

    // Данные игрока
    const playerData = await db
      .select()
      .from(players)
      .where(eq(players.id, playerId))
      .limit(1);

    if (playerData.length === 0) {
      return Response.json({ error: "Player not found" }, { status: 404 });
    }

    // Все результаты игрока с названиями дисциплин
    const playerResults = await db
      .select({
        place: results.place,
        score: results.score,
        createdAt: results.createdAt,
        disciplineId: disciplines.id,
        disciplineName: disciplines.name,
        disciplineEmoji: disciplines.emoji,
        disciplineSlug: disciplines.slug,
      })
      .from(results)
      .innerJoin(disciplines, eq(results.disciplineId, disciplines.id))
      .where(eq(results.playerId, playerId))
      .orderBy(results.createdAt);

    // Общий счёт и ранк среди всех
    const allPlayers = await db
      .select({
        id: players.id,
        score: results.score,
      })
      .from(players)
      .leftJoin(results, eq(players.id, results.playerId));

    // Суммируем очки по каждому игроку
    const scoreMap: Record<number, number> = {};
    for (const row of allPlayers) {
      if (!scoreMap[row.id]) scoreMap[row.id] = 0;
      if (row.score) scoreMap[row.id] += row.score;
    }

    // Ранк текущего игрока
    const sortedScores = Object.values(scoreMap).sort((a, b) => b - a);
    const playerTotalScore = scoreMap[playerId] || 0;
    const rank = sortedScores.indexOf(playerTotalScore) + 1;

    return Response.json({
      player: playerData[0],
      results: playerResults,
      totalScore: playerTotalScore,
      rank,
      totalPlayers: Object.keys(scoreMap).length,
    });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}