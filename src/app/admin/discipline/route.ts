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
      rules,
      downloadUrl,
      scheduledAt,
      isActive,
    } = body;

    const expectedSecret = process.env.BOT_SECRET || "koryazhma-secret-2026";
    if (secret !== expectedSecret) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!slug) {
      return Response.json({ error: "Missing slug" }, { status: 400 });
    }

    await db
      .update(disciplines)
      .set({
        description: description || null,
        rules: rules || null,
        downloadUrl: downloadUrl || null,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        isActive: isActive ?? true,
      })
      .where(eq(disciplines.slug, slug));

    return Response.json({ ok: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}