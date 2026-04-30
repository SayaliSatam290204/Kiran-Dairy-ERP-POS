import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

const COLORS = [
  "#10b981",
  "#3b82f6",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
];

const ProductRevenueChart = ({ data = [], selectedBranches = [] }) => {
  // Filter products by selected branches if any are specified
  const filteredData = selectedBranches.length > 0 ? data : data;

  // ✅ Safe + Top 10 products
  const chartData = filteredData
    .slice(0, 10)
    .map((product) => ({
      name: product.productName || "N/A",
      revenue: product.totalRevenue || 0,
      quantity: product.totalQuantity || 0,
    }));

  const legendPayload = [
    { value: "Revenue", type: "square", id: "revenue", color: "#10b981" },
    { value: "Quantity", type: "square", id: "quantity", color: "#3b82f6" },
  ];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={chartData}
        margin={{ top: 20, right: 30, left: 10, bottom: 70 }}
      >
        {/* Grid */}
      <CartesianGrid
        strokeDasharray="3 3"
        vertical={false}
        stroke="#f1f5f9"
      />

      {/* X Axis */}
      <XAxis
        dataKey="name"
        angle={-40}
        textAnchor="end"
        interval={0}
        height={70}
        tick={{ fill: "#64748b", fontSize: 11 }}
      />

      {/* Y Axis */}
      <YAxis
        yAxisId="left"
        tickFormatter={(value) => value}
        tick={{ fill: "#64748b", fontSize: 11 }}
        axisLine={false}
        tickLine={false}
        width={40}
      />
      <YAxis
        yAxisId="right"
        orientation="right"
        tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
        tick={{ fill: "#64748b", fontSize: 11 }}
        axisLine={false}
        tickLine={false}
        width={60}
      />

      {/* Tooltip */}
      <Tooltip
        formatter={(value, name) => [
          typeof name === "string" && name.toLowerCase().includes("revenue")
            ? `₹${value.toLocaleString()}`
            : value,
          typeof name === "string" && name.toLowerCase().includes("revenue")
            ? "Revenue"
            : "Quantity",
        ]}
        labelStyle={{ fontWeight: 600 }}
      />

      {/* Legend */}
      <Legend payload={legendPayload} />

      {/* Bars */}
      <Bar
        yAxisId="right"
        dataKey="revenue"
        fill="#10b981"
        name="Revenue"
        radius={[6, 6, 0, 0]}
      />

      <Bar
        yAxisId="left"
        dataKey="quantity"
        fill="#3b82f6"
        name="Quantity"
        radius={[6, 6, 0, 0]}
      />
    </BarChart>
    </ResponsiveContainer>
  );
};

export default ProductRevenueChart;