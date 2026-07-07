import { db } from "@/db";
import { players, disciplines, results, updateLog } from "@/db/schema";
import { desc, eq, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Get all disciplines
    const allDisciplines = await db
      .select()
      .from(disciplines)
      .orderBy(disciplines.id);

    // Get all results joined with players and disciplines
    const allResults = await db
      .select({
        playerId: players.id,
        playerName: players.name,
        playerAvatar: players.avatarUrl,
        discordId: players.discordId,
        disciplineId: results.disciplineId,
        disciplineSlug: disciplines.slug,
        disciplineName: disciplines.name,
        disciplineEmoji: disciplines.emoji,
        place: results.place,
        score: results.score,
      })
      .from(results)
      .innerJoin(players, eq(results.playerId, players.id))
      .innerJoin(disciplines, eq(results.disciplineId, disciplines.id));

    // Calculate overall leaderboard (sum of scores)
    const overallScores = await db
      .select({
        playerId: players.id,
        playerName: players.name,
        playerAvatar: players.avatarUrl,
        discordId: players.discordId,
        totalScore: sql<number>`COALESCE(SUM(${results.score}), 0)`.as("total_score"),
        gamesPlayed: sql<number>`COUNT(${results.id})`.as("games_played"),
      })
      .from(players)
      .leftJoin(results, eq(players.id, results.playerId))
      .groupBy(players.id, players.name, players.avatarUrl, players.discordId)
      .orderBy(desc(sql`COALESCE(SUM(${results.score}), 0)`));

    // Get last update timestamp
    const lastUpdate = await db
      .select()
      .from(updateLog)
      .orderBy(desc(updateLog.updatedAt))
      .limit(1);

    // Per-discipline leaderboards
    const disciplineLeaderboards: Record<
      string,
      { playerId: number; playerName: string; playerAvatar: string | null; place: number; score: number }[]
    > = {};

    for (const d of allDisciplines) {
      const dResults = allResults
        .filter((r) => r.disciplineId === d.id)
        .sort((a, b) => a.place - b.place);
      disciplineLeaderboards[d.slug] = dResults.map((r) => ({
        playerId: r.playerId,
        playerName: r.playerName,
        playerAvatar: r.playerAvatar,
        place: r.place,
        score: r.score,
      }));
    }

    return Response.json({
      overall: overallScores,
      disciplines: allDisciplines,
      disciplineLeaderboards,
      results: allResults,
      lastUpdate: lastUpdate.length > 0 ? lastUpdate[0].updatedAt : null,
    });
  } catch (err: unknown) {
    console.error("GET /api/leaderboard error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}
