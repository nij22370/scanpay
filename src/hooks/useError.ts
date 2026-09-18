import { z } from "zod";

export function generateError(error: unknown): string {
  if (error instanceof z.ZodError) {
    return error.errors.map((e) => e.message).join(", ");
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "An unexpected error occurred";
}
