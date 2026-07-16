import { db } from "@/db";
import { disciplines } from "@/db/schema";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

const GAMES = [
  { slug: "xonotic", name: "Xonotic", emoji: "🔫" },
  { slug: "hex-bots", name: "Hex Bots", emoji: "🤖" },
  { slug: "geoguessr", name: "Geoguessr", emoji: "🌏" },
  { slug: "chess", name: "Chess", emoji: "♟️" },
  { slug: "super-auto-pets", name: "Super Auto Pets", emoji: "🐶" },
  { slug: "freestyle2", name: "Freestyle 2: Street Basketball", emoji: "🏀" },
  { slug: "brawlhalla", name: "Brawlhalla", emoji: "⚔️" },
  { slug: "dota2", name: "Dota 2 (1v1 solo mid)", emoji: "🐉" },
  { slug: "minecraft", name: "Minecraft (мини-игра)", emoji: "⛏️" },
  { slug: "tetris", name: "Tetris", emoji: "⏱️" },
  { slug: "graphwar", name: "Graphwar", emoji: "💥" },
  { slug: "minesweeper", name: "Minesweeper", emoji: "💣" },
  { slug: "cs2d", name: "CS2D", emoji: "🔫" },
  { slug: "sigame", name: "SIGame", emoji: "❓" },
  { slug: "momentum-mod", name: "Momentum Mod", emoji: "🦘" },
  { slug: "wordle", name: "Wordle", emoji: "🇼" },
  { slug: "pvz", name: "Plants vs Zombies: Бесконечный", emoji: "🍆" },
];

export async function POST() {
  try {
    for (const game of GAMES) {
      await db
        .insert(disciplines)
        .values(game)
        .onConflictDoUpdate({
          target: disciplines.slug,
          set: { name: game.name, emoji: game.emoji },
        });
    }

    const count = await db.select({ count: sql<number>`count(*)` }).from(disciplines);

    return Response.json({ ok: true, disciplines: count[0].count });
  } catch (err: unknown) {
    console.error("Seed error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}
