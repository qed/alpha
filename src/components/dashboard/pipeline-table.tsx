"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  createColumnHelper,
  flexRender,
  type SortingState,
} from "@tanstack/react-table";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  CONCERN_LABELS,
  type PipelineStage,
  type Concern,
} from "@/lib/constants/pipeline";
import {
  deriveNextMove,
  type ProspectForCopilot,
} from "@/lib/pipeline/copilot-engine";
import { PipelineFilteredEmptyState } from "./pipeline-empty-state";

export interface PipelineRow {
  id: string;
  parent_first: string;
  parent_last: string;
  parent_email: string | null;
  parent_phone: string | null;
  spouse_name: string | null;
  source: string | null;
  status: PipelineStage;
  heat_score: number;
  concerns: string[];
  engagement_signals: string[];
  last_touch_at: string;
  neighborhood: string | null;
  follow_up_date: string | null;
  first_responded_at: string | null;
  consent_given: boolean;
  consent_at: string | null;
  created_at: string;
  updated_at: string;
  child_count: number;
}

interface PipelineTableProps {
  prospects: PipelineRow[];
  onClearFilters: () => void;
}

import { daysSince } from "@/lib/utils/dates";

function LastTouchCell({ value }: { value: string }) {
  const days = daysSince(value);
  let colorClass: string;
  let label: string;

  if (days <= 7) {
    colorClass = "text-success";
    label = days === 0 ? "Today" : days === 1 ? "1d ago" : `${days}d ago`;
  } else if (days <= 14) {
    colorClass = "text-warning";
    label = `${days}d ago`;
  } else {
    colorClass = "text-danger";
    label = `${days}d ago`;
  }

  return <span className={`text-xs font-medium ${colorClass}`}>{label}</span>;
}

function HeatPips({ score }: { score: number }) {
  return (
    <span className="inline-flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={`w-2 h-2 rounded-full ${
            i <= score ? "bg-alpha-coral" : "bg-line"
          }`}
        />
      ))}
    </span>
  );
}

function ConcernChips({ concerns }: { concerns: string[] }) {
  if (concerns.length === 0) {
    return <span className="text-ink-3 text-xs">--</span>;
  }

  const visible = concerns.slice(0, 2);
  const overflow = concerns.length - 2;

  return (
    <span className="inline-flex gap-1 flex-wrap">
      {visible.map((c) => (
        <span
          key={c}
          className="px-1.5 py-0.5 text-[10px] rounded-pill bg-paper-3 text-ink-3 border border-line"
        >
          {CONCERN_LABELS[c as Concern] ?? c}
        </span>
      ))}
      {overflow > 0 && (
        <span className="px-1.5 py-0.5 text-[10px] rounded-pill bg-paper-3 text-ink-3 border border-line">
          +{overflow}
        </span>
      )}
    </span>
  );
}

function InitialsAvatar({
  first,
  last,
}: {
  first: string;
  last: string;
}) {
  const initials = `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
  return (
    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-alpha-sky text-alpha-blue text-xs font-bold shrink-0">
      {initials}
    </span>
  );
}

const columnHelper = createColumnHelper<PipelineRow>();

export function PipelineTable({
  prospects,
  onClearFilters,
}: PipelineTableProps) {
  const router = useRouter();
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns = useMemo(
    () => [
      columnHelper.accessor(
        (row) => `${row.parent_first} ${row.parent_last}`,
        {
          id: "family",
          header: "Family",
          cell: (info) => {
            const row = info.row.original;
            const kidsLabel =
              row.child_count === 1
                ? "1 kid"
                : row.child_count > 1
                  ? `${row.child_count} kids`
                  : null;
            return (
              <div className="flex items-center gap-2">
                <InitialsAvatar
                  first={row.parent_first}
                  last={row.parent_last}
                />
                <div className="min-w-0">
                  <div className="font-medium text-ink truncate">
                    {info.getValue()}
                  </div>
                  {kidsLabel && (
                    <div className="text-[11px] text-ink-3">{kidsLabel}</div>
                  )}
                </div>
              </div>
            );
          },
        }
      ),
      columnHelper.accessor("status", {
        header: "Stage",
        cell: (info) => <StatusBadge stage={info.getValue()} />,
      }),
      columnHelper.accessor("heat_score", {
        header: "Heat",
        cell: (info) => <HeatPips score={info.getValue()} />,
      }),
      columnHelper.accessor("neighborhood", {
        header: "Neighborhood",
        cell: (info) => (
          <span className="text-ink-3 text-sm">
            {info.getValue() ?? "--"}
          </span>
        ),
      }),
      columnHelper.accessor("concerns", {
        header: "Concerns",
        enableSorting: false,
        cell: (info) => <ConcernChips concerns={info.getValue()} />,
      }),
      columnHelper.accessor("last_touch_at", {
        header: "Last Touch",
        cell: (info) => <LastTouchCell value={info.getValue()} />,
      }),
      columnHelper.display({
        id: "next_action",
        header: "Next Action",
        cell: (info) => {
          const row = info.row.original;
          const copilotData: ProspectForCopilot = {
            stage: row.status,
            heat_score: row.heat_score,
            concerns: row.concerns,
            daysSinceLastTouch: daysSince(row.last_touch_at),
          };
          const { message } = deriveNextMove(copilotData, new Set());
          return (
            <span className="text-xs text-ink-3 line-clamp-2">{message}</span>
          );
        },
      }),
    ],
    []
  );

  const table = useReactTable({
    data: prospects,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (prospects.length === 0) {
    return <PipelineFilteredEmptyState onClearFilters={onClearFilters} />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id} className="border-b border-line">
              {hg.headers.map((header) => (
                <th
                  key={header.id}
                  onClick={header.column.getToggleSortingHandler()}
                  className="px-3 py-2 text-left text-xs font-semibold text-ink-3 uppercase tracking-wider cursor-pointer select-none hover:text-ink"
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                  {header.column.getIsSorted() === "asc" && " ↑"}
                  {header.column.getIsSorted() === "desc" && " ↓"}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              onClick={() =>
                router.push(
                  `/hub/pipeline?prospect=${row.original.id}`
                )
              }
              className="border-b border-line hover:bg-paper-2 transition-colors cursor-pointer"
            >
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-3 py-3">
                  {flexRender(
                    cell.column.columnDef.cell,
                    cell.getContext()
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
