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

const ProfitLossLineChart = ({ data = [], selectedBranches = [] }) => {
  const filteredData =
    selectedBranches.length > 0
      ? data.filter((branch) => selectedBranches.includes(branch.shopId))
      : data;

  const chartData = filteredData.map((branch) => ({
    name: branch.shopName || "N/A",
    profitLoss: (branch.actualRevenue || 0) - (branch.expectedRevenue || 0),
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 70 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis
          dataKey="name"
          angle={-40}
          textAnchor="end"
          interval={0}
          height={75}
          tick={{ fill: "#475569", fontSize: 12 }}
        />
        <YAxis
          tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
          tick={{ fill: "#475569", fontSize: 12 }}
        />
        <Tooltip
          formatter={(value) => [`₹${value.toLocaleString()}`, "Profit/Loss"]}
          labelStyle={{ fontWeight: 700 }}
        />
        <Legend verticalAlign="top" height={36} />
        <Line
          type="monotone"
          dataKey="profitLoss"
          stroke="#16a34a"
          strokeWidth={3}
          dot={{ r: 5, fill: "#16a34a" }}
          activeDot={{ r: 7 }}
          name="Profit/Loss"
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default ProfitLossLineChart;
