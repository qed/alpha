"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import {
  selectGeography,
  createGeography,
} from "@/lib/actions/geography-selection";

interface GeographyOption {
  id: string;
  name: string;
  region: string | null;
  country: string;
}

interface GeographyPickerProps {
  geographies: GeographyOption[];
}

export function GeographyPicker({ geographies }: GeographyPickerProps) {
  const router = useRouter();
  const { user } = useUser();
  const [search, setSearch] = useState("");
  const [mode, setMode] = useState<"select" | "create">("select");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [newGeo, setNewGeo] = useState({
    name: "",
    region: "",
    country: "US" as "US" | "CA",
  });

  const filtered = geographies.filter((g) => {
    const q = search.toLowerCase();
    return (
      g.name.toLowerCase().includes(q) ||
      (g.region && g.region.toLowerCase().includes(q)) ||
      g.country.toLowerCase().includes(q)
    );
  });

  async function handleRefresh() {
    try {
      await user?.reload();
    } catch {
      // Fallback: full page reload if Clerk refresh fails
    }
    router.refresh();
  }

  async function handleSelect(geographyId: string) {
    setError(null);
    setLoading(true);

    const result = await selectGeography({ geographyId });

    if (result.success) {
      await handleRefresh();
      return;
    }

    setError(result.error || "Failed to select geography.");
    setLoading(false);

    if (result.error?.includes("just claimed")) {
      router.refresh();
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await createGeography(newGeo);

    if (result.success) {
      await handleRefresh();
      return;
    }

    setError(result.error || "Failed to create geography.");
    setLoading(false);
  }

  function switchToCreate() {
    setMode("create");
    setNewGeo((prev) => ({ ...prev, name: search }));
    setError(null);
  }

  return (
    <div className="max-w-lg mx-auto py-12">
      <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-ink mb-2">
        Select your geography
      </h2>
      <p className="text-sm text-ink-3 mb-6">
        Choose the geography you&rsquo;ll champion, or create a new one if yours
        isn&rsquo;t listed.
      </p>

      {error && (
        <div className="p-3 mb-4 bg-danger/10 border border-danger/20 rounded-sm text-sm text-danger">
          {error}
        </div>
      )}

      {mode === "select" ? (
        <>
          <input
            type="text"
            placeholder="Search geographies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3 py-2 border border-line rounded-sm text-sm focus:outline-none focus:border-alpha-blue mb-3"
            disabled={loading}
          />

          {filtered.length > 0 ? (
            <ul className="border border-line rounded-sm divide-y divide-line max-h-72 overflow-y-auto mb-4">
              {filtered.map((g) => (
                <li key={g.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(g.id)}
                    disabled={loading}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-paper-2 disabled:opacity-50 flex justify-between items-center"
                  >
                    <span className="font-medium text-ink">{g.name}</span>
                    {g.region && (
                      <span className="text-ink-3 text-xs">{g.region}, {g.country}</span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-6 text-sm text-ink-3 border border-line rounded-sm mb-4">
              {search
                ? "No geographies match your search."
                : "No geographies available."}
            </div>
          )}

          <button
            type="button"
            onClick={switchToCreate}
            disabled={loading}
            className="text-sm text-alpha-blue hover:underline disabled:opacity-50"
          >
            {filtered.length === 0 && search
              ? `Create "${search}" as a new geography`
              : "Create a new geography"}
          </button>
        </>
      ) : (
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label htmlFor="geo-name" className="block text-sm font-medium text-ink mb-1">
              Geography name *
            </label>
            <input
              id="geo-name"
              type="text"
              required
              maxLength={100}
              value={newGeo.name}
              onChange={(e) =>
                setNewGeo((prev) => ({ ...prev, name: e.target.value }))
              }
              className="w-full px-3 py-2 border border-line rounded-sm text-sm focus:outline-none focus:border-alpha-blue"
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="geo-region" className="block text-sm font-medium text-ink mb-1">
              Region *
            </label>
            <input
              id="geo-region"
              type="text"
              required
              maxLength={100}
              value={newGeo.region}
              onChange={(e) =>
                setNewGeo((prev) => ({ ...prev, region: e.target.value }))
              }
              placeholder="e.g. Illinois, Ontario"
              className="w-full px-3 py-2 border border-line rounded-sm text-sm focus:outline-none focus:border-alpha-blue"
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="geo-country" className="block text-sm font-medium text-ink mb-1">
              Country *
            </label>
            <select
              id="geo-country"
              value={newGeo.country}
              onChange={(e) =>
                setNewGeo((prev) => ({
                  ...prev,
                  country: e.target.value as "US" | "CA",
                }))
              }
              className="w-full px-3 py-2 border border-line rounded-sm text-sm focus:outline-none focus:border-alpha-blue bg-paper"
              disabled={loading}
            >
              <option value="US">United States</option>
              <option value="CA">Canada</option>
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-alpha-blue text-white font-semibold rounded-sm hover:bg-alpha-blue-600 disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create & Select"}
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("select");
                setError(null);
              }}
              disabled={loading}
              className="px-6 py-2 text-ink-3 border border-line rounded-sm hover:bg-paper-2 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading && mode === "select" && (
        <p className="text-sm text-ink-3 mt-3">Assigning geography...</p>
      )}
    </div>
  );
}
