import { db } from "@/db";
import { players } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const allPlayers = await db
      .select()
      .from(players)
      .orderBy(players.name);
    return Response.json({ players: allPlayers });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}