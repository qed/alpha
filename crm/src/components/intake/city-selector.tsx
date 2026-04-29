"use client";

import { useRouter } from "next/navigation";
import type { DbGeography } from "@/types/database";

interface CitySelectorProps {
  geographies: Pick<DbGeography, "slug" | "name">[];
  currentSlug: string;
}

export function CitySelector({ geographies, currentSlug }: CitySelectorProps) {
  const router = useRouter();

  return (
    <select
      value={currentSlug}
      onChange={(e) => router.push(`/${e.target.value}`)}
      className="w-full px-3 py-2 border border-line rounded-sm text-sm focus:outline-none focus:border-alpha-blue bg-paper"
    >
      {geographies.map((geo) => (
        <option key={geo.slug} value={geo.slug}>
          {geo.name}
        </option>
      ))}
    </select>
  );
}
