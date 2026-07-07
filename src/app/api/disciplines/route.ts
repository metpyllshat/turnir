import { db } from "@/db";
import { disciplines } from "@/db/schema";

export const dynamic = "force-dynamic";

// GET – list all disciplines
export async function GET() {
  try {
    const allDisciplines = await db.select().from(disciplines).orderBy(disciplines.id);
    return Response.json({ disciplines: allDisciplines });
  } catch (err: unknown) {
    console.error("GET /api/disciplines error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}

// POST – add a new discipline
// Body: { secret, slug, name, emoji }
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { secret, slug, name, emoji } = body;

    const expectedSecret = process.env.BOT_SECRET || "koryazhma-secret-2026";
    if (secret !== expectedSecret) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!slug || !name) {
      return Response.json({ error: "Missing slug or name" }, { status: 400 });
    }

    const [newDiscipline] = await db
      .insert(disciplines)
      .values({ slug, name, emoji: emoji || "🎮" })
      .onConflictDoUpdate({
        target: disciplines.slug,
        set: { name, emoji: emoji || "🎮" },
      })
      .returning();

    return Response.json({ ok: true, discipline: newDiscipline });
  } catch (err: unknown) {
    console.error("POST /api/disciplines error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}
