import { db } from "@/db";
import { updateLog } from "@/db/schema";
import { desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let lastId = 0;

      // Get initial last update id
      const initial = await db
        .select()
        .from(updateLog)
        .orderBy(desc(updateLog.id))
        .limit(1);

      if (initial.length > 0) {
        lastId = initial[0].id;
      }

      // Send initial heartbeat
      controller.enqueue(encoder.encode(`data: {"type":"connected"}\n\n`));

      const interval = setInterval(async () => {
        try {
          const latest = await db
            .select()
            .from(updateLog)
            .orderBy(desc(updateLog.id))
            .limit(1);

          if (latest.length > 0 && latest[0].id > lastId) {
            lastId = latest[0].id;
            controller.enqueue(
              encoder.encode(
                `data: {"type":"update","id":${lastId},"time":"${latest[0].updatedAt.toISOString()}"}\n\n`
              )
            );
          }

          // Heartbeat every poll
          controller.enqueue(encoder.encode(`: heartbeat\n\n`));
        } catch {
          // If DB fails, just skip this poll
        }
      }, 3000);

      // Cleanup when client disconnects
      const cleanup = () => {
        clearInterval(interval);
      };

      // Store cleanup for abort
      (controller as unknown as Record<string, () => void>)._cleanup = cleanup;
    },
    cancel() {
      // Stream cancelled by client
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
