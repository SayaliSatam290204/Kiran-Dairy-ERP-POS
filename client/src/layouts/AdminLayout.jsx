import { Navbar } from '../components/common/Navbar.jsx';
import { Sidebar } from '../components/common/Sidebar.jsx';
import { StockDiscrepancies } from '../pages/admin/StockDiscrepancies.jsx';

export const AdminLayout = ({ children }) => {
  return (
    <div>
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 bg-gray-50 min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
};
