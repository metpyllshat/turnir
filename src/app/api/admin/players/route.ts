import { db } from "@/db";
import { players } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const allPlayers = await db
      .select({
        id: players.id,
        discordId: players.discordId,
        name: players.name,
        avatarUrl: players.avatarUrl,
      })
      .from(players)
      .orderBy(players.name);

    return Response.json({ players: allPlayers });
  } catch (err: unknown) {
    console.error("GET /api/admin/players error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}