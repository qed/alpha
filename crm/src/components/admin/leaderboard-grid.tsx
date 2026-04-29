"use client";

import Link from "next/link";
import { ProgressBar } from "@/components/shared/progress-bar";

export interface GeographyCard {
  id: string;
  slug: string;
  name: string;
  status: string;
  enrolledCount: number;
  totalChildren: number;
  championName: string | null;
}

interface LeaderboardGridProps {
  geographies: GeographyCard[];
}

export function LeaderboardGrid({ geographies }: LeaderboardGridProps) {
  const preLaunch = geographies
    .filter((g) => g.status === "pre-launch")
    .sort((a, b) => b.enrolledCount - a.enrolledCount);

  const existing = geographies
    .filter((g) => g.status !== "pre-launch")
    .sort((a, b) => b.enrolledCount - a.enrolledCount);

  return (
    <div className="space-y-8">
      <section>
        <h2 className="font-[family-name:var(--font-display)] text-lg font-bold text-ink mb-4">
          Pre-Launch ({preLaunch.length})
        </h2>
        {preLaunch.length === 0 ? (
          <p className="text-sm text-ink-3">No pre-launch geographies.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {preLaunch.map((geo) => (
              <GeographyCardItem key={geo.id} geography={geo} />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="font-[family-name:var(--font-display)] text-lg font-bold text-ink mb-4">
          Active & Existing Campuses ({existing.length})
        </h2>
        {existing.length === 0 ? (
          <p className="text-sm text-ink-3">No active campuses.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {existing.map((geo) => (
              <GeographyCardItem key={geo.id} geography={geo} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function GeographyCardItem({ geography }: { geography: GeographyCard }) {
  return (
    <Link
      href={`/geography/${geography.slug}`}
      className="block bg-paper rounded-md border border-line p-4 hover:border-alpha-blue transition-colors no-underline"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-[family-name:var(--font-display)] font-bold text-ink">
          {geography.name}
        </h3>
        <span className="text-xs text-ink-3">
          {geography.totalChildren} children
        </span>
      </div>
      <ProgressBar count={geography.enrolledCount} className="mb-2" />
      <div className="text-xs text-ink-3">
        {geography.championName
          ? `Champion: ${geography.championName}`
          : "No champion assigned"}
      </div>
    </Link>
  );
}
