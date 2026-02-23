import { z } from "zod";

export const signupSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters long").max(50),
  email: z.email("Invalid email format").toLowerCase(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .max(30, "Password must be at most 30 characters long"),
});

export const loginSchema = z.object({
  email: z.email("Invalid email format").toLowerCase(),
  password: z.string(),
});
