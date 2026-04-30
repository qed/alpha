"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  inviteChampion,
  deactivateChampion,
  reassignGeography,
} from "@/lib/actions/champions";

interface Champion {
  id: string;
  full_name: string;
  email: string;
  geography_id: string | null;
  geography_name: string | null;
  is_active: boolean;
}

interface Geography {
  id: string;
  name: string;
}

interface ChampionManagerProps {
  champions: Champion[];
  geographies: Geography[];
}

export function ChampionManager({
  champions,
  geographies,
}: ChampionManagerProps) {
  const router = useRouter();
  const [showInvite, setShowInvite] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [inviteForm, setInviteForm] = useState({
    email: "",
    fullName: "",
    geographyId: "",
  });

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await inviteChampion(inviteForm);
    setLoading(false);

    if (result.success) {
      setShowInvite(false);
      setInviteForm({ email: "", fullName: "", geographyId: "" });
      router.refresh();
    } else {
      setError(result.error || "Failed to invite champion.");
    }
  };

  const handleDeactivate = async (profileId: string, name: string) => {
    if (!confirm(`Deactivate ${name}? Their prospect data will be preserved.`)) {
      return;
    }
    setError(null);
    const result = await deactivateChampion(profileId);
    if (result.success) {
      router.refresh();
    } else {
      setError(result.error || "Failed to deactivate.");
    }
  };

  const handleReassign = async (
    geographyId: string,
    newChampionId: string
  ) => {
    setError(null);
    const result = await reassignGeography({
      geographyId,
      newChampionProfileId: newChampionId,
    });
    if (result.success) {
      router.refresh();
    } else {
      setError(result.error || "Failed to reassign.");
    }
  };

  const assignedGeoIds = new Set(
    champions
      .filter((c) => c.is_active && c.geography_id)
      .map((c) => c.geography_id)
  );
  const availableGeographies = geographies.filter(
    (g) => !assignedGeoIds.has(g.id)
  );

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-3 bg-danger/10 border border-danger/20 rounded-sm text-sm text-danger">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between">
        <h2 className="font-[family-name:var(--font-display)] text-lg font-bold text-ink">
          Champions
        </h2>
        <button
          type="button"
          onClick={() => setShowInvite(!showInvite)}
          className="px-4 py-2 text-sm font-medium bg-alpha-blue text-white rounded-sm hover:bg-alpha-blue-600"
        >
          + Invite Champion
        </button>
      </div>

      {showInvite && (
        <form
          onSubmit={handleInvite}
          className="bg-paper rounded-md border border-line p-4 space-y-3"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="Full name"
              required
              value={inviteForm.fullName}
              onChange={(e) =>
                setInviteForm((p) => ({ ...p, fullName: e.target.value }))
              }
              className="px-3 py-2 border border-line rounded-sm text-sm focus:outline-none focus:border-alpha-blue"
            />
            <input
              type="email"
              placeholder="Email"
              required
              value={inviteForm.email}
              onChange={(e) =>
                setInviteForm((p) => ({ ...p, email: e.target.value }))
              }
              className="px-3 py-2 border border-line rounded-sm text-sm focus:outline-none focus:border-alpha-blue"
            />
            <select
              required
              value={inviteForm.geographyId}
              onChange={(e) =>
                setInviteForm((p) => ({ ...p, geographyId: e.target.value }))
              }
              className="px-3 py-2 border border-line rounded-sm text-sm focus:outline-none focus:border-alpha-blue bg-paper"
            >
              <option value="">Assign to geography...</option>
              {availableGeographies.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm bg-alpha-blue text-white rounded-sm hover:bg-alpha-blue-600 disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send Invitation"}
            </button>
            <button
              type="button"
              onClick={() => setShowInvite(false)}
              className="px-4 py-2 text-sm text-ink-3 border border-line rounded-sm hover:bg-paper-2"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="bg-paper rounded-md border border-line overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line">
              <th className="px-4 py-2 text-left text-xs font-semibold text-ink-3 uppercase tracking-wider">
                Name
              </th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-ink-3 uppercase tracking-wider">
                Email
              </th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-ink-3 uppercase tracking-wider">
                Geography
              </th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-ink-3 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-ink-3 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {champions.map((champ) => (
              <tr
                key={champ.id}
                className="border-b border-line last:border-0"
              >
                <td className="px-4 py-3 font-medium text-ink">
                  {champ.full_name}
                </td>
                <td className="px-4 py-3 text-ink-3">{champ.email}</td>
                <td className="px-4 py-3 text-ink-3">
                  {champ.geography_name || "—"}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-pill text-xs font-medium ${
                      champ.is_active
                        ? "bg-success/10 text-success"
                        : "bg-danger/10 text-danger"
                    }`}
                  >
                    {champ.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    {champ.is_active && (
                      <>
                        <select
                          onChange={(e) => {
                            if (e.target.value) {
                              handleReassign(e.target.value, champ.id);
                              e.target.value = "";
                            }
                          }}
                          className="px-2 py-1 text-xs border border-line rounded-sm bg-paper"
                        >
                          <option value="">Reassign...</option>
                          {availableGeographies.map((g) => (
                            <option key={g.id} value={g.id}>
                              {g.name}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() =>
                            handleDeactivate(champ.id, champ.full_name)
                          }
                          className="px-2 py-1 text-xs text-danger hover:text-danger/80"
                        >
                          Deactivate
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
