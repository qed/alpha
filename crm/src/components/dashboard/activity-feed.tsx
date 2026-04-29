"use client";

import { useState } from "react";
import { StatusBadge } from "@/components/shared/status-badge";
import type { PipelineStage } from "@/lib/constants/pipeline";

export interface ActivityItem {
  id: string;
  action: string;
  created_at: string;
  metadata: Record<string, unknown> | null;
  prospect_name?: string;
}

interface ActivityFeedProps {
  items: ActivityItem[];
  pageSize?: number;
}

function formatAction(item: ActivityItem): string {
  switch (item.action) {
    case "prospect-create":
      return `${item.prospect_name || "New family"} signed up`;
    case "status-change": {
      const name = item.prospect_name || "A prospect";
      return `${name} moved to`;
    }
    case "note-add":
      return `Note added for ${item.prospect_name || "a prospect"}`;
    default:
      return item.action;
  }
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export function ActivityFeed({ items, pageSize = 20 }: ActivityFeedProps) {
  const [visibleCount, setVisibleCount] = useState(pageSize);

  const visibleItems = items.slice(0, visibleCount);
  const hasMore = visibleCount < items.length;

  if (items.length === 0) {
    return (
      <div className="bg-paper rounded-md border border-line p-6">
        <h2 className="font-[family-name:var(--font-display)] text-lg font-bold text-ink mb-4">
          Recent Activity
        </h2>
        <p className="text-sm text-ink-3">No activity yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-paper rounded-md border border-line p-6">
      <h2 className="font-[family-name:var(--font-display)] text-lg font-bold text-ink mb-4">
        Recent Activity
      </h2>
      <ul className="space-y-3">
        {visibleItems.map((item) => (
          <li
            key={item.id}
            className="flex items-start gap-3 text-sm border-b border-line pb-3 last:border-0 last:pb-0"
          >
            <span className="text-ink-3 whitespace-nowrap">
              {formatTime(item.created_at)}
            </span>
            <span className="text-ink">
              {formatAction(item)}
              {item.action === "status-change" &&
                typeof item.metadata?.new_status === "string" && (
                  <>
                    {" "}
                    <StatusBadge
                      stage={item.metadata.new_status as PipelineStage}
                    />
                  </>
                )}
            </span>
          </li>
        ))}
      </ul>
      {hasMore && (
        <button
          type="button"
          onClick={() => setVisibleCount((c) => c + pageSize)}
          className="mt-4 text-sm text-alpha-blue hover:text-alpha-blue-600 font-medium"
        >
          Show more
        </button>
      )}
    </div>
  );
}
