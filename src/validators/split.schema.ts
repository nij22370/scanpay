import { z } from "zod";

export const SplitParticipantSchema = z.object({
  id: z.string().uuid(),
  split_session_id: z.string().uuid(),
  user_id: z.string().uuid(),
  assigned_amount: z.number().positive("Assigned amount must be positive"),
  paid_amount: z.number().nonnegative(),
  is_paid: z.boolean(),
  paid_at: z.string().nullable(),
  created_at: z.string(),
});

export const SplitSessionSchema = z.object({
  id: z.string().uuid(),
  transaction_id: z.string().uuid(),
  total_amount: z.number().positive("Total amount must be positive"),
  paid_amount: z.number().nonnegative(),
  status: z.string(),
  created_by: z.string().uuid(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const CreateSplitSchema = z.object({
  total: z.number().positive("Total must be positive"),
  people_count: z.number().int().min(2, "At least 2 people required").max(10, "Maximum 10 people allowed"),
  split_type: z.enum(["equal", "custom", "percentage"]),
});

export type SplitParticipant = z.infer<typeof SplitParticipantSchema>;
export type SplitSession = z.infer<typeof SplitSessionSchema>;
export type CreateSplit = z.infer<typeof CreateSplitSchema>;
