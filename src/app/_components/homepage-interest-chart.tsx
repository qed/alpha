"use client";

import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
} from "recharts";

const CHART_DATA = [
  { grade: "K", interest: 7 },
  { grade: "1", interest: 5 },
  { grade: "2", interest: 9 },
  { grade: "3", interest: 11 },
  { grade: "4", interest: 6 },
  { grade: "5", interest: 8 },
  { grade: "6", interest: 4 },
  { grade: "7", interest: 10 },
  { grade: "8", interest: 12 },
];

export function HomepageInterestChart() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="wp-chart">
      <div className="wp-chart-inner">
        <div className="wp-chart-eyebrow">Current Interest</div>
        <h2 className="wp-chart-heading">
          Families Already Raising Their Hands
        </h2>
        <p className="wp-chart-subtitle">
          Interest is building across every grade. Here&rsquo;s a snapshot of
          where Toronto families stand today.
        </p>
        <div className="wp-chart-container">
          <div className="wp-chart-title">
            Indicative Interest by Grade &mdash; 2025-26
          </div>
          <div className="wp-chart-meta">
            K-8 Families &middot; Alpha Toronto (North, Central and West)
          </div>
          {mounted ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={CHART_DATA}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <XAxis
                  dataKey="grade"
                  tick={{ fill: "rgba(255,255,255,0.7)", fontSize: 13 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis hide />
                <Bar
                  dataKey="interest"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={48}
                  label={{
                    position: "top",
                    fill: "rgba(255,255,255,0.7)",
                    fontSize: 12,
                  }}
                >
                  {CHART_DATA.map((_, index) => (
                    <Cell
                      key={index}
                      fill={index % 2 === 0 ? "#4444FF" : "#6666FF"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 300 }} />
          )}
        </div>
        <p className="wp-chart-disclaimer">
          Based on early expressions of interest from Toronto families. Data
          reflects informal survey, not formal commitments.
        </p>
      </div>
    </section>
  );
}
