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
  { grade: "K", interest: 28 },
  { grade: "1st", interest: 35 },
  { grade: "2nd", interest: 42 },
  { grade: "3rd", interest: 38 },
  { grade: "4th", interest: 45 },
  { grade: "5th", interest: 52 },
  { grade: "6th", interest: 40 },
  { grade: "7th", interest: 30 },
  { grade: "8th", interest: 22 },
];

export function InterestChart() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="wp-chart">
      <div className="wp-chart-inner">
        <div className="wp-chart-heading">Indicative Interest by Grade</div>
        <div className="wp-chart-title">Alpha Example City</div>
        <div className="wp-chart-subtitle">from local families</div>
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
              <Bar dataKey="interest" radius={[6, 6, 0, 0]} maxBarSize={48}>
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
    </section>
  );
}
