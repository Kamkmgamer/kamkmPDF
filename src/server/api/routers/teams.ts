import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { randomUUID } from "~/lib/crypto-edge";
import { eq, and, or } from "drizzle-orm";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";
import { teamMembers, userSubscriptions } from "~/server/db/schema";
import {
  getTierConfig,
  type SubscriptionTier,
} from "~/server/subscription/tiers";

export const teamsRouter = createTRPCRouter({
  /**
   * Get team members for the current user's team
   */
  listMembers: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.userId;

    // Check if user has team collaboration
    const subscription = await db
      .select()
      .from(userSubscriptions)
      .where(eq(userSubscriptions.userId, userId))
      .limit(1);

    const tier = (subscription[0]?.tier ?? "starter") as SubscriptionTier;
    const tierConfig = getTierConfig(tier);

    if (!tierConfig.features.teamCollaboration) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message:
          "Team collaboration is not available on your plan. Upgrade to Business or Enterprise.",
      });
    }

    // Get members where user is the owner
    const members = await db
      .select()
      .from(teamMembers)
      .where(eq(teamMembers.teamOwnerId, userId));

    return {
      members,
      limit: tierConfig.quotas.teamSeats,
      used: members.length,
    };
  }),

  /**
   * Invite a team member
   */
  inviteMember: protectedProcedure
    .input(
      z.object({
        email: z.string().email(),
        role: z.enum(["admin", "member", "viewer"]).default("member"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.userId;

      // Check if user has team collaboration
      const subscription = await db
        .select()
        .from(userSubscriptions)
        .where(eq(userSubscriptions.userId, userId))
        .limit(1);

      const tier = (subscription[0]?.tier ?? "starter") as SubscriptionTier;
      const tierConfig = getTierConfig(tier);

      if (!tierConfig.features.teamCollaboration) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message:
            "Team collaboration is not available on your plan. Upgrade to Business or Enterprise.",
        });
      }

      // Check seat limit
      const existingMembers = await db
        .select()
        .from(teamMembers)
        .where(
          and(
            eq(teamMembers.teamOwnerId, userId),
            or(
              eq(teamMembers.status, "active"),
              eq(teamMembers.status, "pending"),
            ),
          ),
        );

      if (
        tierConfig.quotas.teamSeats !== -1 &&
        existingMembers.length >= tierConfig.quotas.teamSeats
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: `You've reached your team seat limit of ${tierConfig.quotas.teamSeats}. Upgrade or remove members to add more.`,
        });
      }

      // Check if already invited
      const existing = await db
        .select()
        .from(teamMembers)
        .where(
          and(
            eq(teamMembers.teamOwnerId, userId),
            eq(teamMembers.inviteEmail, input.email),
          ),
        )
        .limit(1);

      if (existing[0]) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "This email has already been invited",
        });
      }

      // Create invitation
      const id = randomUUID();
      await db.insert(teamMembers).values({
        id,
        teamOwnerId: userId,
        memberUserId: "", // Will be filled when user accepts
        role: input.role,
        inviteEmail: input.email,
        status: "pending",
      });

      // TODO: Send invitation email

      return { success: true, inviteId: id };
    }),

  /**
   * Remove a team member
   */
  removeMember: protectedProcedure
    .input(z.object({ memberId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.userId;

      const member = await db
        .select()
        .from(teamMembers)
        .where(eq(teamMembers.id, input.memberId))
        .limit(1);

      if (member[0]?.teamOwnerId !== userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to remove this member",
        });
      }

      await db
        .update(teamMembers)
        .set({ status: "revoked" })
        .where(eq(teamMembers.id, input.memberId));

      return { success: true };
    }),

  /**
   * Update team member role
   */
  updateMemberRole: protectedProcedure
    .input(
      z.object({
        memberId: z.string(),
        role: z.enum(["admin", "member", "viewer"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.userId;

      const member = await db
        .select()
        .from(teamMembers)
        .where(eq(teamMembers.id, input.memberId))
        .limit(1);

      if (member[0]?.teamOwnerId !== userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to update this member",
        });
      }

      await db
        .update(teamMembers)
        .set({ role: input.role })
        .where(eq(teamMembers.id, input.memberId));

      return { success: true };
    }),

  /**
   * Accept a team invitation (for invited users)
   */
  acceptInvitation: protectedProcedure
    .input(z.object({ inviteId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.userId;

      const invitation = await db
        .select()
        .from(teamMembers)
        .where(eq(teamMembers.id, input.inviteId))
        .limit(1);

      if (!invitation[0]) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invitation not found",
        });
      }

      if (invitation[0].status !== "pending") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "This invitation is no longer valid",
        });
      }

      // Update invitation with user ID and activate
      await db
        .update(teamMembers)
        .set({
          memberUserId: userId,
          status: "active",
        })
        .where(eq(teamMembers.id, input.inviteId));

      return { success: true };
    }),

  /**
   * Get teams the current user is a member of
   */
  listTeamsAsMember: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.userId;

    const teams = await db
      .select()
      .from(teamMembers)
      .where(
        and(
          eq(teamMembers.memberUserId, userId),
          eq(teamMembers.status, "active"),
        ),
      );

    return teams;
  }),
});
