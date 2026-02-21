import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

export const rateProject = mutation({
  args: {
    ideaId: v.number(),
    score: v.number(),
    userId: v.string(),
    comment: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.score < 1 || args.score > 5) throw new Error('score must be between 1 and 5');

    const existing = await ctx.db
      .query('ratings')
      .withIndex('by_ideaId', (q) => q.eq('ideaId', args.ideaId))
      .collect();

    const mine = existing.find((r) => r.userId === args.userId);
    if (mine) {
      await ctx.db.patch(mine._id, { score: args.score, comment: args.comment });
      return mine._id;
    }

    return await ctx.db.insert('ratings', args);
  },
});

export const getIdeaRatings = query({
  args: { ideaId: v.number() },
  handler: async (ctx, args) => {
    const rows = await ctx.db
      .query('ratings')
      .withIndex('by_ideaId', (q) => q.eq('ideaId', args.ideaId))
      .collect();

    const count = rows.length;
    const avg = count ? rows.reduce((acc, r) => acc + r.score, 0) / count : 0;
    return { count, avg, rows };
  },
});
