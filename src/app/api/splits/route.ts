import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { z } from "zod";

const splitSchema = z.object({
  transaction_id: z.string().uuid("Invalid transaction id"),
  total_amount: z.coerce.number().positive("Total must be positive"),
  paid_amount: z.coerce.number().nonnegative().default(0),
  status: z.string().default("pending"),
  created_by: z.string().default("system"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = splitSchema.parse(body);

    const { data, error } = await supabaseAdmin
      .from("split_sessions")
      .insert(parsed)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors.map((e) => e.message).join(", ") }, { status: 400 });
    }
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    let query = supabaseAdmin.from("split_sessions").select("*").order("created_at", { ascending: false });
    if (status) query = query.eq("status", status);

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}