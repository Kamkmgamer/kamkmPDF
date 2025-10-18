import { createHash } from "crypto";
import { eq, and } from "drizzle-orm";
import { db } from "~/server/db";
import { webhooks } from "~/server/db/schema";

interface WebhookPayload {
  event: string;
  timestamp: string;
  data: Record<string, unknown>;
}

/**
 * Trigger webhooks for a user based on event type
 */
export async function triggerWebhooks(
  userId: string,
  eventType: string,
  data: Record<string, unknown>,
): Promise<void> {
  // Get active webhooks for this user that listen to this event
  const userWebhooks = await db
    .select()
    .from(webhooks)
    .where(and(eq(webhooks.userId, userId), eq(webhooks.isActive, true)));

  // Filter webhooks that listen to this event
  const relevantWebhooks = userWebhooks.filter((webhook) =>
    (webhook.events as unknown as string[]).includes(eventType),
  );

  // Trigger each webhook
  const promises = relevantWebhooks.map(async (webhook) => {
    const payload: WebhookPayload = {
      event: eventType,
      timestamp: new Date().toISOString(),
      data,
    };

    // Create signature
    const signature = createHash("sha256")
      .update(JSON.stringify(payload) + webhook.secret)
      .digest("hex");

    try {
      const response = await fetch(webhook.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Webhook-Signature": signature,
          "X-Webhook-Event": eventType,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        // Increment failure count
        await db
          .update(webhooks)
          .set({
            failureCount: webhook.failureCount + 1,
          })
          .where(eq(webhooks.id, webhook.id));

        // Disable webhook after 10 consecutive failures
        if (webhook.failureCount >= 9) {
          await db
            .update(webhooks)
            .set({
              isActive: false,
            })
            .where(eq(webhooks.id, webhook.id));
        }
      } else {
        // Reset failure count on success
        await db
          .update(webhooks)
          .set({
            failureCount: 0,
            lastTriggeredAt: new Date(),
          })
          .where(eq(webhooks.id, webhook.id));
      }
    } catch (error) {
      // Increment failure count on error
      await db
        .update(webhooks)
        .set({
          failureCount: webhook.failureCount + 1,
        })
        .where(eq(webhooks.id, webhook.id));

      console.error(`Failed to trigger webhook ${webhook.id}:`, error);
    }
  });

  // Fire and forget
  void Promise.all(promises);
}
