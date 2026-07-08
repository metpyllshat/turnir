import { db } from "@/db";
import { disciplines } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      secret,
      slug,
      description,
      downloadUrl,
      scheduledAt,
      completedAt, // 🆕
      isActive,
      isOver, // 🆕
    } = body;

    const expectedSecret = process.env.BOT_SECRET || "koryazhma-secret-2026";
    if (secret !== expectedSecret) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!slug) {
      return Response.json({ error: "Missing slug" }, { status: 400 });
    }

    const updated = await db
      .update(disciplines)
      .set({
        description: description || null,
        downloadUrl: downloadUrl || null,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        completedAt: completedAt ? new Date(completedAt) : (isOver ? new Date() : null),
        isActive: isActive ?? true,
        isOver: isOver ?? false,
      })
      .where(eq(disciplines.slug, slug))
      .returning();

    if (updated.length === 0) {
      return Response.json({ error: `Дисциплина '${slug}' не найдена` }, { status: 404 });
    }

    return Response.json({ ok: true, discipline: updated[0] });
  } catch (err: unknown) {
    console.error("POST /api/admin/discipline error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}