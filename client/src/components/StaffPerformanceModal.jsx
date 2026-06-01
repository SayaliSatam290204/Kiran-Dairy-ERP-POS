import { Modal } from "./ui/Modal.jsx";
import { Badge } from "./ui/Badge.jsx";
import { formatCurrency } from "../utils/formatCurrency.js";
import { useAuth } from "../hooks/useAuth.js";

export const StaffPerformanceModal = ({ isOpen, onClose, staff, performance }) => {
  if (!staff || !performance) return null;

  // Resolve raw data arrays safely & normalize MongoDB group objects
  const rawDaily =
    performance.daily?.length ? performance.daily : (performance.dailyBreakdown || []);

  const dailyData = (rawDaily || []).map((day) => ({
    ...day,
    date: day.date || day._id?.date || null,
    shift: day.shift || day._id?.shift || "-",
    totalSales: day.totalSales ?? 0,
    totalAmount: day.totalAmount ?? 0,
    itemsSold: day.itemsSold ?? 0,
    avgSaleAmount:
      day.avgSaleAmount ??
      (day.totalSales > 0 ? (day.totalAmount || 0) / day.totalSales : 0)
  }));

  const weeklyData = performance.weekly || {};
  const monthlyData =
    performance.monthly?.totalSales !== undefined
      ? performance.monthly
      : (performance.monthlyPerformance || {});
  const yearlyData =
    performance.yearly?.totalSales !== undefined
      ? performance.yearly
      : (performance.yearlyPerformance || {});

  const hasNoData =
    dailyData.length === 0 &&
    (!weeklyData.totalSales || weeklyData.totalSales === 0) &&
    (!monthlyData.totalSales || monthlyData.totalSales === 0) &&
    (!yearlyData.totalSales || yearlyData.totalSales === 0);

  const { user } = useAuth();
  const isShopUser = user?.role === 'shop';
  const showSalary = !isShopUser;
  const showStaffDetails = !isShopUser;
  const cleanStaffName = (staff?.name || "").split(" - ")[0];

  const Section = ({ title, subtitle, variant = "neutral", children }) => (
    <div
      className={`rounded-2xl border p-6 shadow-sm w-full ${
        variant === "staff"
          ? "bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-200"
          : variant === "performance"
            ? "bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200"
            : "border-slate-200 bg-white"
      }`}
    >
      <div className="mb-4">
        <h3 className="text-xl font-bold text-slate-900">{title}</h3>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {children}
    </div>
  );

  // Bulletproof native-table layout (no overflow-x wrappers)
  const MetricTable = ({ rows, variant = "neutral" }) => (
    <div className="rounded-xl border border-slate-200 bg-white w-full overflow-hidden">
      <table className="w-full table-fixed text-sm border-collapse">
        <tbody className="divide-y divide-slate-100">
          {rows.map((row) => (
            <tr
              key={row.label}
              className="hover:bg-slate-50 transition-colors"
            >
              <td
                className={`w-1/2 px-4 py-3.5 font-semibold text-left align-top whitespace-nowrap ${
                  variant === "staff" ? "text-indigo-700" : "text-slate-700"
                }`}
              >
                {row.label}
              </td>
              <td
                className={`w-1/2 px-4 py-3.5 text-left font-medium break-words align-top whitespace-pre-line ${
                  variant === "staff"
                    ? "text-indigo-900"
                    : variant === "performance"
                      ? "text-emerald-700"
                      : "text-slate-900"
                }`}
              >
                {row.value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const summaryRows = [
    { label: "Weekly Sales", value: weeklyData.totalSales || 0 },
    {
      label: "Monthly Revenue",
      value: formatCurrency(monthlyData.totalAmount || 0)
    },
    { label: "Yearly Items Sold", value: yearlyData.itemsSold || 0 },
    {
      label: "Monthly Avg Sale",
      value: formatCurrency(monthlyData.avgSaleAmount || 0)
    }
  ];

  const staffInfoRows = [
    { label: "Staff Name", value: staff.name?.split(" - ")[0] || "N/A" },
    { label: "Email", value: staff.email || "N/A" },
    { label: "Phone", value: staff.phone || "N/A" }
  ];

  if (showSalary) {
    staffInfoRows.push({
      label: "Base Salary",
      value:
        staff?.baseSalary === undefined || staff?.baseSalary === null
          ? performance?.staff?.baseSalary === undefined || performance?.staff?.baseSalary === null
            ? "N/A"
            : formatCurrency(performance.staff.baseSalary)
          : formatCurrency(staff.baseSalary)
    });
  }

  const weeklyRows = [
    { label: "Total Sales", value: weeklyData.totalSales || 0 },
    {
      label: "Revenue",
      value: formatCurrency(weeklyData.totalAmount || 0)
    },
    { label: "Items Sold", value: weeklyData.itemsSold || 0 },
    {
      label: "Avg Sale",
      value: formatCurrency(weeklyData.avgSaleAmount || 0)
    }
  ];

  const monthlyRows = [
    { label: "Total Sales", value: monthlyData.totalSales || 0 },
    {
      label: "Revenue",
      value: formatCurrency(monthlyData.totalAmount || 0)
    },
    { label: "Items Sold", value: monthlyData.itemsSold || 0 },
    {
      label: "Avg Sale",
      value: formatCurrency(monthlyData.avgSaleAmount || 0)
    }
  ];

  const yearlyRows = [
    { label: "Total Sales", value: yearlyData.totalSales || 0 },
    {
      label: "Revenue",
      value: formatCurrency(yearlyData.totalAmount || 0)
    },
    { label: "Items Sold", value: yearlyData.itemsSold || 0 },
    {
      label: "Avg Sale",
      value: formatCurrency(yearlyData.avgSaleAmount || 0)
    }
  ];

  const hasWeekly = (weeklyData?.totalSales || 0) > 0;
  const hasMonthly = (monthlyData?.totalSales || 0) > 0;
  const hasYearly = (yearlyData?.totalSales || 0) > 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${cleanStaffName} - Performance Overview`}
      size="3xl"
    >
      <div className="mx-auto max-h-[80vh] w-full space-y-6 overflow-y-auto pr-2">
        {showStaffDetails && (
          <Section
            title="Staff Details"
            subtitle="Basic information and assigned shifts."
            variant="staff"
          >
            <MetricTable rows={staffInfoRows} variant="staff" />

            {staff.shifts && staff.shifts.length > 0 && (
              <div className="mt-4">
                <p className="mb-2 text-sm font-semibold text-indigo-700">
                  Assigned Shifts
                </p>
                <div className="flex flex-wrap gap-2">
                  {staff.shifts.map((shift) => (
                    <Badge
                      key={shift}
                      className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold capitalize text-indigo-700 border border-indigo-200"
                    >
                      {shift} Shift
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </Section>
        )}

        {hasNoData ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center w-full">
            <div className="mx-auto max-w-md">
              <h3 className="text-lg font-semibold text-slate-900">
                No performance data available
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                This staff member does not have sales performance records yet for the selected
                periods.
              </p>
            </div>
          </div>
        ) : (
          <>
            <Section
              title="Performance Summary"
              subtitle="Quick snapshot of current weekly, monthly and yearly performance."
              variant="performance"
            >
              <MetricTable rows={summaryRows} variant="performance" />
            </Section>

            {dailyData.length > 0 && (
              <Section
                title="Daily Performance"
                subtitle="Recent performance entries shown in row format."
                variant="performance"
              >
                <div className="rounded-xl border border-slate-200 bg-white w-full overflow-hidden">
                  <table className="w-full table-fixed border-collapse text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="w-1/4 px-4 py-3 text-left font-semibold text-slate-700">
                          Date / Entry
                        </th>
                        <th className="w-1/4 px-4 py-3 text-left font-semibold text-slate-700">
                          Shift
                        </th>
                        <th className="w-1/4 px-4 py-3 text-right font-semibold text-slate-700">
                          Sales
                        </th>
                        <th className="w-1/4 px-4 py-3 text-right font-semibold text-slate-700">
                          Revenue
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {dailyData.map((day, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3.5 font-medium text-slate-900 truncate">
                            {day.date || `Entry ${idx + 1}`}
                          </td>
                          <td className="px-4 py-3.5 text-slate-700 capitalize truncate">
                            {day.shift}
                          </td>
                          <td className="px-4 py-3.5 text-right font-medium text-emerald-700">
                            {day.totalSales || 0}
                          </td>
                          <td className="px-4 py-3.5 text-right font-bold text-emerald-600">
                            {formatCurrency(day.totalAmount || 0)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Section>
            )}

            {hasWeekly && (
              <Section
                title="Weekly Performance"
                subtitle="Current week totals in table row format."
              >
                <MetricTable rows={weeklyRows} variant="performance" />
              </Section>
            )}

            {hasMonthly && (
              <Section
                title="Monthly Performance"
                subtitle="Current month totals in table row format."
              >
                <MetricTable rows={monthlyRows} variant="performance" />
              </Section>
            )}

            {hasYearly && (
              <Section
                title="Yearly Performance"
                subtitle="Current year totals in table row format."
              >
                <MetricTable rows={yearlyRows} variant="performance" />
              </Section>
            )}
          </>
        )}
      </div>
    </Modal>
  );
};

