import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Card } from "../../components/ui/Card.jsx";
import { DataTable } from "../../components/common/DataTable.jsx";
import { Skeleton } from "../../components/ui/Skeleton.jsx";
import { Badge } from "../../components/ui/Badge.jsx";
import { salesApi } from "../../api/salesApi.js";
import { formatCurrency } from "../../utils/formatCurrency.js";
import { formatDate } from "../../utils/formatDate.js";

export const SalesHistory = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSales = async () => {
      try {
        const response = await salesApi.getHistory();
        setSales(response.data.data || []);
      } catch (error) {
        console.error("Failed to fetch sales:", error);
        toast.error(error.response?.data?.message || "Failed to load sales history");
      } finally {
        setLoading(false);
      }
    };

    fetchSales();
  }, []);

  const columns = [
    { key: "billNo", label: "Bill No" },
    { 
      key: "staffId", 
      label: "Staff / Shift", 
      render: (val, row) => (
        <div className="flex flex-col">
          <span className="font-semibold text-gray-800">{val?.name || "Shop Owner"}</span>
          <span className="text-[10px] text-gray-500 uppercase font-bold tracking-tight">
            {row.shift === "morning" ? "☀️ Morning" : "🌙 Evening"}
          </span>
        </div>
      )
    },
    {
      key: "items",
      label: "Items",
      render: (_, row) => {
        if (!row.items || row.items.length === 0) return "-";
        return row.items.map(item => `${item.productName || 'Item'} x${item.quantity || 1}`).join(", ");
      }
    },
    { key: "totalAmount", label: "Amount", render: (val) => formatCurrency(val || 0) },
    {
      key: "paymentMethod",
      label: "Payment",
      render: (val) => {
        const p = String(val || "").toLowerCase();
        const displayVal = p === "split" ? "cash + UPI" : val;
        const finalVariant = (p === "cash" || p === "cash + upi") ? "green" : "blue";
        return <Badge variant={finalVariant}>{String(displayVal || "-").toUpperCase()}</Badge>;
      },
    },
    { key: "saleDate", label: "Date", render: (val) => formatDate(val) },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Sales History</h1>

      <Card>
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={sales}
            emptyState={
              <div>
                <div className="text-lg font-semibold">No sales yet</div>
                <div className="text-sm mt-1">Start selling from POS to see history.</div>
              </div>
            }
          />
        )}
      </Card>
    </div>
  );
};