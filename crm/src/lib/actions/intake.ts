"use server";

import { intakeFormSchema } from "@/lib/validations/intake-schema";
import { createClient } from "@supabase/supabase-js";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { headers } from "next/headers";

interface IntakeResult {
  success: boolean;
  error?: string;
  prospectId?: string;
  isResubmission?: boolean;
}

async function verifyTurnstile(token: string, ip: string): Promise<boolean> {
  const response = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        secret: process.env.TURNSTILE_SECRET_KEY!,
        response: token,
        remoteip: ip,
      }),
    }
  );
  const data = await response.json();
  return data.success === true;
}

function getRateLimiter() {
  return new Ratelimit({
    redis: new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    }),
    limiter: Ratelimit.slidingWindow(5, "1 h"),
    prefix: "intake",
  });
}

export async function submitIntakeForm(
  formData: unknown
): Promise<IntakeResult> {
  const parsed = intakeFormSchema.safeParse(formData);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Validation failed",
    };
  }

  const data = parsed.data;

  const headerStore = await headers();
  const ip =
    headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

  // Rate limiting
  try {
    const limiter = getRateLimiter();
    const { success: allowed } = await limiter.limit(ip);
    if (!allowed) {
      return { success: false, error: "Too many submissions. Please try again later." };
    }
  } catch {
    // If Redis is unavailable, allow the request but log
    console.error("Rate limiter unavailable, allowing request");
  }

  // Verify Turnstile
  const turnstileValid = await verifyTurnstile(data.turnstile_token, ip);
  if (!turnstileValid) {
    return { success: false, error: "Bot verification failed. Please try again." };
  }

  // Use anon key to call the SECURITY DEFINER function
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: result, error } = await supabase.rpc("submit_intake", {
    p_geography_slug: data.geography_slug,
    p_parent_first: data.parent_first,
    p_parent_last: data.parent_last,
    p_parent_email: data.parent_email,
    p_parent_phone: data.parent_phone || null,
    p_spouse_name: data.spouse_name || null,
    p_source: data.source || null,
    p_children: JSON.stringify(
      data.children.map((c) => ({
        first_name: c.first_name,
        grade: c.grade || null,
        age: c.age ?? null,
        gender: c.gender || null,
      }))
    ),
  });

  if (error) {
    console.error("Intake submission failed:", error);
    return { success: false, error: "Submission failed. Please try again." };
  }

  if (result?.error) {
    return { success: false, error: result.message || "Invalid geography" };
  }

  return {
    success: true,
    prospectId: result.prospect_id,
    isResubmission: result.is_resubmission,
  };
}
