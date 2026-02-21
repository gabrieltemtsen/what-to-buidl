import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  ratings: defineTable({
    ideaId: v.number(),
    score: v.number(),
    userId: v.string(),
    comment: v.optional(v.string()),
  }).index('by_ideaId', ['ideaId']),
});
