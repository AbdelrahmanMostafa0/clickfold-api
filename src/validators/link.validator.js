import { z } from "zod";

const httpUrl = z
  .string()
  .min(1, "Destination URL is required")
  .refine((val) => {
    try {
      const url = new URL(val);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch {
      return false;
    }
  }, "Destination must be a valid http(s) URL");

const slugSchema = z
  .string()
  .min(1, "Slug is required")
  .max(100, "Slug must be at most 100 characters")
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/i,
    "Slug may only contain letters, numbers, and hyphens",
  );

export const createLinkSchema = z.object({
  slug: slugSchema,
  destination: httpUrl,
  ogTitle: z.string().max(200).optional(),
  ogDescription: z.string().max(500).optional(),
  ogMode: z.enum(["custom", "original", "none"]).optional().default("original"),
  campaignId: z.string().optional().nullable(),
  tags: z.union([z.string(), z.array(z.string())]).optional(),
});

export const updateLinkSchema = createLinkSchema.extend({
  ogImage: z.string().optional(),
});
