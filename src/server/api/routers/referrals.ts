import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { randomUUID } from "~/lib/crypto-edge";
import { eq, sql, desc, count } from "drizzle-orm";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";
import {
  userSubscriptions,
  referrals,
  referralRewards,
  usageHistory,
} from "~/server/db/schema";

/**
 * Generate a unique referral code based on user ID
 */
function generateReferralCode(userId: string): string {
  // Create a short, readable code from user ID
  const hash = userId.split("").reduce((acc, char) => {
    return (acc << 5) - acc + char.charCodeAt(0);
  }, 0);

  const code = Math.abs(hash).toString(36).toUpperCase().slice(0, 8);
  const timestamp = Date.now().toString(36).toUpperCase().slice(-4);

  return `REF${code}${timestamp}`;
}

export const referralRouter = createTRPCRouter({
  /**
   * Get or create user's referral code and stats
   */
  getMyReferralInfo: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.userId;

    // Get or create user subscription with referral code
    const subscription = await db
      .select()
      .from(userSubscriptions)
      .where(eq(userSubscriptions.userId, userId))
      .limit(1);

    if (!subscription[0]) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Subscription not found",
      });
    }

    let referralCode = subscription[0].referralCode;

    // Generate referral code if it doesn't exist
    if (!referralCode) {
      referralCode = generateReferralCode(userId);

      // Update subscription with new referral code
      await db
        .update(userSubscriptions)
        .set({ referralCode })
        .where(eq(userSubscriptions.userId, userId));
    }

    // Get referral stats
    const referralStats = await db
      .select({
        totalReferrals: count(),
        completedReferrals: sql<number>`COUNT(CASE WHEN ${referrals.status} = 'rewarded' THEN 1 END)`,
        pendingReferrals: sql<number>`COUNT(CASE WHEN ${referrals.status} = 'pending' THEN 1 END)`,
      })
      .from(referrals)
      .where(eq(referrals.referrerId, userId));

    // Get total credits earned from referrals
    const rewardsResult = await db
      .select({
        totalCredits: sql<number>`COALESCE(SUM(${referralRewards.creditsAwarded}), 0)`,
      })
      .from(referralRewards)
      .where(eq(referralRewards.userId, userId));

    const totalCreditsEarned = rewardsResult[0]?.totalCredits ?? 0;

    // Get recent referrals
    const recentReferrals = await db
      .select({
        id: referrals.id,
        referredUserId: referrals.referredUserId,
        status: referrals.status,
        createdAt: referrals.createdAt,
        completedAt: referrals.completedAt,
      })
      .from(referrals)
      .where(eq(referrals.referrerId, userId))
      .orderBy(desc(referrals.createdAt))
      .limit(10);

    return {
      referralCode,
      referralLink: `${process.env.NEXT_PUBLIC_APP_URL}?ref=${referralCode}`,
      stats: {
        totalReferrals: referralStats[0]?.totalReferrals ?? 0,
        completedReferrals: referralStats[0]?.completedReferrals ?? 0,
        pendingReferrals: referralStats[0]?.pendingReferrals ?? 0,
        totalCreditsEarned,
      },
      recentReferrals,
    };
  }),

  /**
   * Apply a referral code when a new user signs up
   */
  applyReferralCode: protectedProcedure
    .input(
      z.object({
        referralCode: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.userId;

      // Check if user has already been referred
      const existingReferral = await db
        .select()
        .from(referrals)
        .where(eq(referrals.referredUserId, userId))
        .limit(1);

      if (existingReferral[0]) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You have already used a referral code",
        });
      }

      // Find the referrer by referral code
      const referrerSubscription = await db
        .select()
        .from(userSubscriptions)
        .where(eq(userSubscriptions.referralCode, input.referralCode))
        .limit(1);

      if (!referrerSubscription[0]) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invalid referral code",
        });
      }

      const referrerId = referrerSubscription[0].userId;

      // Can't refer yourself
      if (referrerId === userId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You cannot use your own referral code",
        });
      }

      // Create referral record
      const referralId = randomUUID();
      await db.insert(referrals).values({
        id: referralId,
        referrerId,
        referredUserId: userId,
        referralCode: input.referralCode,
        status: "pending",
        createdAt: new Date(),
      });

      // Log the referral
      await db.insert(usageHistory).values({
        id: randomUUID(),
        userId: referrerId,
        action: "referral_created",
        amount: 1,
        metadata: {
          referredUserId: userId,
          referralId,
        },
        createdAt: new Date(),
      });

      return {
        success: true,
        message:
          "Referral code applied successfully! Your referrer will receive credits when you subscribe to a paid plan.",
      };
    }),

  /**
   * Get referral leaderboard (optional - for gamification)
   */
  getLeaderboard: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(10),
      }),
    )
    .query(async ({ input }) => {
      const leaderboard = await db
        .select({
          userId: referrals.referrerId,
          completedReferrals: sql<number>`COUNT(CASE WHEN ${referrals.status} = 'rewarded' THEN 1 END)`,
        })
        .from(referrals)
        .groupBy(referrals.referrerId)
        .orderBy(
          desc(
            sql`COUNT(CASE WHEN ${referrals.status} = 'rewarded' THEN 1 END)`,
          ),
        )
        .limit(input.limit);

      return leaderboard;
    }),
});
