import React from "react";
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

const StaffPerformanceChart = ({ data = [] }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-slate-500">
        No staff performance data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis
          type="number"
          dataKey="sales"
          name="Sales Count"
          tick={{ fill: "#475569", fontSize: 11 }}
          label={{ value: "Total Sales", position: "insideBottomRight", offset: -5 }}
        />
        <YAxis
          type="number"
          dataKey="amount"
          name="Revenue Amount"
          tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
          tick={{ fill: "#475569", fontSize: 11 }}
          label={{ value: "Total Amount (₹)", angle: -90, position: "insideLeft" }}
        />
        <Tooltip
          cursor={{ strokeDasharray: "3 3" }}
          formatter={(value, name) =>
            name === "amount"
              ? `₹${value.toLocaleString()}`
              : value
          }
          labelStyle={{ fontWeight: 700 }}
        />
        <Legend />
        <Scatter
          name="Staff Performance"
          data={data}
          fill="#f59e0b"
        />
      </ScatterChart>
    </ResponsiveContainer>
  );
};

export default StaffPerformanceChart;
