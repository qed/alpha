"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ENGAGEMENT_SIGNALS,
  SIGNAL_LABELS,
  type EngagementSignal,
} from "@/lib/constants/pipeline";
import { toggleSignal } from "@/lib/actions/pipeline";

interface SignalGridProps {
  prospectId: string;
  activeSignals: string[];
}

export function SignalGrid({ prospectId, activeSignals }: SignalGridProps) {
  const router = useRouter();
  const [pending, setPending] = useState<string | null>(null);

  const handleToggle = async (signalId: EngagementSignal) => {
    const isActive = activeSignals.includes(signalId);
    setPending(signalId);

    const result = await toggleSignal({
      prospect_id: prospectId,
      signal_id: signalId,
      active: !isActive,
    });

    setPending(null);

    if (result.success) {
      router.refresh();
    }
  };

  return (
    <div>
      <h4 className="text-xs font-semibold text-ink-3 uppercase tracking-wider mb-2">
        Engagement Signals
      </h4>
      <div className="grid grid-cols-2 gap-2">
        {ENGAGEMENT_SIGNALS.map((signal) => {
          const isActive = activeSignals.includes(signal);
          const isPending = pending === signal;

          return (
            <button
              key={signal}
              type="button"
              onClick={() => handleToggle(signal)}
              disabled={isPending}
              className={`px-3 py-2 text-xs font-medium rounded-sm border transition-colors text-left ${
                isActive
                  ? "bg-alpha-blue text-white border-alpha-blue"
                  : "bg-paper text-ink-3 border-line hover:border-alpha-blue/40 hover:text-ink"
              } ${isPending ? "opacity-50" : ""}`}
            >
              {SIGNAL_LABELS[signal]}
            </button>
          );
        })}
      </div>
    </div>
  );
}
