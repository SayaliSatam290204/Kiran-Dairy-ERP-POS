import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#10b981", "#3b82f6", "#f59e0b"];

const BranchDetailChart = ({ branchReport }) => {
  if (!branchReport) {
    return (
      <div className="flex h-full items-center justify-center text-slate-500">
        No branch report available
      </div>
    );
  }

  const totalRevenue = branchReport.totalRevenue || 0;
  const expectedRevenue = branchReport.expectedRevenue || 0;
  const gap = Math.abs(
    branchReport.revenueDifference ?? expectedRevenue - totalRevenue
  );

  const chartData = [
    {
      name: "Total Revenue",
      value: totalRevenue,
      fill: COLORS[0],
    },
    {
      name: "Expected Revenue",
      value: expectedRevenue,
      fill: COLORS[1],
    },
    {
      name: "Gap (Profit/Loss)",
      value: gap,
      fill: COLORS[2],
    },
  ];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={50}
          outerRadius={80}
          cornerRadius={6}
          dataKey="value"
          nameKey="name"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Pie>

        <Tooltip
          formatter={(value, name) => [
            `₹${value.toLocaleString()}`,
            name,
          ]}
          labelStyle={{ fontSize: 13, fontWeight: 600 }}
        />

        <Legend verticalAlign="bottom" height={36} iconType="circle" />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default BranchDetailChart;