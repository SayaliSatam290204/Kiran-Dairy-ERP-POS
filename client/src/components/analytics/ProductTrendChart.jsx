import React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

const ProductTrendChart = ({ data = [] }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-slate-500">
        No product trend data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
        <defs>
          <linearGradient id="colorQuantity" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis
          dataKey="name"
          tick={{ fill: "#475569", fontSize: 11 }}
        />
        <YAxis
          yAxisId="left"
          tick={{ fill: "#475569", fontSize: 12 }}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
          tick={{ fill: "#475569", fontSize: 12 }}
        />
        <Tooltip
          formatter={(value, name) =>
            name === "quantity"
              ? value
              : `₹${value.toLocaleString()}`
          }
          labelStyle={{ fontWeight: 700 }}
        />
        <Legend verticalAlign="top" height={36} />
        <Area
          yAxisId="left"
          type="monotone"
          dataKey="quantity"
          stroke="#3b82f6"
          fillOpacity={1}
          fill="url(#colorQuantity)"
          name="Quantity Sold"
        />
        <Area
          yAxisId="right"
          type="monotone"
          dataKey="totalRevenue"
          stroke="#10b981"
          fillOpacity={1}
          fill="url(#colorRevenue)"
          name="Revenue"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default ProductTrendChart;
