"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useParams } from "next/navigation";
import { SlipDisplay } from "./SlipDisplay";

function SlipContent({ transactionId }: { transactionId: string }) {
  return <SlipDisplay transactionId={transactionId} />;
}

export default function SlipPageContent() {
  const params = useParams();
  return <SlipContent transactionId={params.id as string} />;
}