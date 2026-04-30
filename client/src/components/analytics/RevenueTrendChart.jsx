import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

const RevenueTrendChart = ({ data = [] }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-slate-500">
        No revenue trend data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis
          dataKey="date"
          tick={{ fill: "#475569", fontSize: 12 }}
          interval={0}
          angle={-35}
          textAnchor="end"
          height={80}
        />
        <YAxis
          tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
          tick={{ fill: "#475569", fontSize: 12 }}
        />
        <Tooltip
          formatter={(value) => `₹${value.toLocaleString()}`}
          labelStyle={{ fontWeight: 700 }}
        />
        <Legend verticalAlign="top" height={36} />
        <Line
          type="monotone"
          dataKey="revenue"
          stroke="#16a34a"
          strokeWidth={2}
          dot={{ r: 4, fill: "#16a34a" }}
          activeDot={{ r: 6 }}
          name="Actual Revenue"
        />
        <Line
          type="monotone"
          dataKey="expectedRevenue"
          stroke="#3b82f6"
          strokeWidth={2}
          dot={{ r: 4, fill: "#3b82f6" }}
          activeDot={{ r: 6 }}
          name="Expected Revenue"
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default RevenueTrendChart;
