// src/pages/Bill.jsx
import { formatCurrency } from "../utils/formatCurrency.js";
import { formatDate, formatDateTime } from "../utils/formatDate.js";
import logoImage from "../assets/logo.png";

export const Bill = ({ billData }) => {
  if (!billData) {
    return (
      <div className="bg-white p-6 rounded-lg border text-center text-gray-600">
        No bill data
      </div>
    );
  }

  const items = billData.items || [];
  const total = items.reduce((sum, item) => {
    const subtotal =
      item.subtotal ?? (Number(item.price || 0) * Number(item.quantity || 0));
    return sum + Number(subtotal || 0);
  }, 0);

  // Calculate taxes assuming total is inclusive of 5% GST for dairy
  const taxableValue = total / 1.05;
  const sgst = (total - taxableValue) / 2;
  const cgst = sgst;
  const igst = 0;

  return (
    <div className="bg-white p-6 rounded-lg border max-w-md mx-auto relative overflow-hidden font-sans">
      {/* Watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.06] z-0">
        <img src={logoImage} alt="Watermark" className="w-72 h-72 object-cover rounded-full grayscale" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold uppercase tracking-wider text-gray-900 mb-1">
            {billData.shopId?.name || "Kiran Dairy Farm"}
          </h1>
          <p className="text-sm text-gray-700 font-medium">
            {billData.shopId?.address || "Pune, Maharashtra, 411014, IN"}
          </p>
          <p className="text-sm text-gray-700">
            PHONE : {billData.shopId?.contactNo || "+91 98765 43210"}
          </p>
          <p className="text-sm text-gray-700">GSTIN : 27AAAAK1234A1Z5</p>
        </div>

        {/* Bill Info */}
        <div className="flex flex-col gap-1 text-sm mb-4 font-semibold text-gray-800">
          <p>Bill No: {billData.billNo || "-"}</p>
<p>Date & Time: {formatDateTime(billData.saleDate)}</p>
        </div>

        <div className="border-t-2 border-b-2 border-dashed border-gray-400 py-3 mb-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-900 font-bold border-b border-gray-300">
                <th className="text-left pb-2 w-8">SN</th>
                <th className="text-left pb-2">Item</th>
                <th className="text-center pb-2 w-12">Qty</th>
                <th className="text-right pb-2 w-20">Price</th>
                <th className="text-right pb-2 w-20">Amt</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-gray-500">
                    No items
                  </td>
                </tr>
              ) : (
                items.map((item, idx) => {
                  const subtotal =
                    item.subtotal ??
                    (Number(item.price || 0) * Number(item.quantity || 0));

                  return (
                    <tr key={idx} className="text-gray-800 border-b border-gray-100 last:border-0">
                      <td className="py-2 align-top">{idx + 1}</td>
                      <td className="py-2 pr-2 align-top">{item.productName || item.productId?.name || "Item"}</td>
                      <td className="text-center py-2 align-top">{item.quantity || 0} {item.unit}</td>
                      <td className="text-right py-2 align-top">{Number(item.price || 0).toFixed(2)}</td>
                      <td className="text-right py-2 align-top">{subtotal.toFixed(2)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Totals & Tax */}
        <div className="w-full text-sm text-gray-800 mb-6">
          <div className="flex justify-between font-bold border-b border-dashed border-gray-300 pb-2 mb-2">
            <span>Subtotal</span>
            <div className="flex justify-end gap-10 min-w-[150px]">
              <span>{items.reduce((acc, curr) => acc + (curr.quantity || 0), 0)}</span>
              <span>₹ {taxableValue.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1 mb-2">
            <div className="flex justify-between w-48 text-gray-600 font-medium">
              <span>SGST @ 2.5%</span>
              <span>{sgst.toFixed(2)}</span>
            </div>
            <div className="flex justify-between w-48 text-gray-600 font-medium">
              <span>CGST @ 2.5%</span>
              <span>{cgst.toFixed(2)}</span>
            </div>
            <div className="flex justify-between w-48 text-gray-600 font-medium">
              <span>IGST @ 0%</span>
              <span>{igst.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex justify-between font-bold text-lg border-t-2 border-dashed border-gray-400 pt-3">
            <span>TOTAL</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>

        {/* Payment details */}
        <div className="bg-gray-50 p-3 rounded mb-4 text-sm border border-gray-200">
{billData.paymentMethod === "Cash + UPI" && billData.paymentDetails ? (
            <div>
              <p className="font-bold mb-1 text-gray-900">Payment Breakdown</p>
              {billData.paymentDetails.upi && (
                <div className="flex justify-between font-medium">
                  <span className="text-gray-700">UPI ({billData.paymentDetails.upi.provider?.toUpperCase() || 'UPI'})</span>
                  <span>{formatCurrency(billData.paymentDetails.upi.amount || 0)}</span>
                </div>
              )}
              {billData.paymentDetails.cash && (
                <div className="flex justify-between font-medium mt-1">
                  <span className="text-gray-700">Cash</span>
                  <span>{formatCurrency(billData.paymentDetails.cash.amount || 0)}</span>
                </div>
              )}
              {billData.paymentDetails.card && (
                <div className="flex justify-between font-medium mt-1">
                  <span className="text-gray-700">Card</span>
                  <span>{formatCurrency(billData.paymentDetails.card.amount || 0)}</span>
                </div>
              )}
            </div>
          ) : (
            <p className="font-medium">
              <span className="font-bold text-gray-900">Payment Method:</span> {billData.paymentMethod?.toUpperCase() || "-"}
              {billData.paymentDetails?.upi?.provider && (
                <span> ({billData.paymentDetails.upi.provider.toUpperCase()})</span>
              )}
            </p>
          )}
        </div>

        <div className="text-center mt-6">
          <p className="font-bold text-gray-900 mb-1">Thank You</p>
          <p className="text-xs text-gray-500 font-medium">Visit Again!</p>
        </div>
      </div>
    </div>
  );
};