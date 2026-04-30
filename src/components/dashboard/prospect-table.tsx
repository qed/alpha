"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  createColumnHelper,
  flexRender,
  type SortingState,
  type FilterFn,
} from "@tanstack/react-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { PIPELINE_STAGES, type PipelineStage } from "@/lib/constants/pipeline";

export interface ProspectRow {
  id: string;
  parent_first: string;
  parent_last: string;
  parent_email: string;
  status: PipelineStage;
  follow_up_date: string | null;
  created_at: string;
  child_count: number;
}

interface ProspectTableProps {
  prospects: ProspectRow[];
}

const columnHelper = createColumnHelper<ProspectRow>();

export function ProspectTable({ prospects }: ProspectTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);

  const filteredData = useMemo(() => {
    if (statusFilter.length === 0) return prospects;
    return prospects.filter((p) => statusFilter.includes(p.status));
  }, [prospects, statusFilter]);

  const columns = useMemo(
    () => [
      columnHelper.accessor(
        (row) => `${row.parent_first} ${row.parent_last}`,
        {
          id: "name",
          header: "Name",
          cell: (info) => (
            <Link
              href={`/hub/prospects/${info.row.original.id}`}
              className="text-alpha-blue hover:underline font-medium"
            >
              {info.getValue()}
            </Link>
          ),
        }
      ),
      columnHelper.accessor("parent_email", {
        header: "Email",
        cell: (info) => (
          <span className="text-ink-3 text-sm">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: (info) => <StatusBadge stage={info.getValue()} />,
      }),
      columnHelper.accessor("child_count", {
        header: "Children",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("follow_up_date", {
        header: "Follow-up",
        cell: (info) => {
          const val = info.getValue();
          if (!val) return <span className="text-ink-3">—</span>;
          return new Date(val).toLocaleDateString();
        },
      }),
      columnHelper.accessor("created_at", {
        header: "Added",
        cell: (info) => new Date(info.getValue()).toLocaleDateString(),
      }),
    ],
    []
  );

  const customGlobalFilter: FilterFn<ProspectRow> = (
    row,
    _columnId,
    filterValue
  ) => {
    const search = (filterValue as string).toLowerCase();
    const name =
      `${row.original.parent_first} ${row.original.parent_last}`.toLowerCase();
    const email = row.original.parent_email.toLowerCase();
    return name.includes(search) || email.includes(search);
  };

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: customGlobalFilter,
  });

  const toggleStatusFilter = (status: string) => {
    setStatusFilter((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="flex-1 px-3 py-2 border border-line rounded-sm text-sm focus:outline-none focus:border-alpha-blue"
        />
        <div className="flex gap-1.5 flex-wrap">
          {PIPELINE_STAGES.map((stage) => (
            <button
              key={stage}
              type="button"
              onClick={() => toggleStatusFilter(stage)}
              className={`px-2.5 py-1 text-xs rounded-pill border transition-colors ${
                statusFilter.includes(stage)
                  ? "bg-alpha-blue text-white border-alpha-blue"
                  : "bg-paper text-ink-3 border-line hover:border-ink-3"
              }`}
            >
              {stage}
            </button>
          ))}
        </div>
      </div>

      {table.getRowModel().rows.length === 0 ? (
        <div className="text-center py-12 text-ink-3 text-sm">
          No prospects found
        </div>
      ) : (
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
                  className="border-b border-line hover:bg-paper-2 transition-colors"
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
      )}
    </div>
  );
}
