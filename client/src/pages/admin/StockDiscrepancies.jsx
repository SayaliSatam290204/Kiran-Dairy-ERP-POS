import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Card } from "../../components/ui/Card.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Modal } from "../../components/ui/Modal.jsx";
import { Input } from "../../components/ui/Input.jsx";
import { DataTable } from "../../components/common/DataTable.jsx";
import { Skeleton } from "../../components/ui/Skeleton.jsx";
import { Badge } from "../../components/ui/Badge.jsx";
import { shopApi } from "../../api/shopApi.js";
import { formatDate } from "../../utils/formatDate.js";

const columns = [
  { 
    key: "dispatchId", 
    label: "Dispatch", 
    render: (val) => val?.dispatchNo || 'N/A' 
  },
  { 
    key: "shopId", 
    label: "Shop", 
    render: (val) => val?.name || 'N/A' 
  },
  { 
    key: "status", 
    label: "Status", 
    render: (val) => <Badge variant={val === 'pending' ? 'red' : 'green'}>{val.toUpperCase()}</Badge> 
  },
  { 
    key: "items", 
    label: "Items", 
    render: (items) => items.length 
  },
  { 
    key: "items", 
    label: "Discrepancies", 
    render: (items) => items.map(i => `${i.productId?.name}: Exp ${i.expectedQty}, Rec ${i.receivedQty}`).join(', ') 
  },
  { 
    key: "createdAt", 
    label: "Reported", 
    render: formatDate 
  },
  { 
    key: "_id", 
    label: "Actions", 
    render: (_, row) => row.status === 'pending' && (
      <Button size="sm" onClick={() => handleResolve(row._id)} className="bg-green-500 hover:bg-green-600">
        Resolve
      </Button>
    ) 
  }
];

export const StockDiscrepancies = () => {
  const [discrepancies, setDiscrepancies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resolveModal, setResolveModal] = useState({ open: false, id: null, notes: '' });

  useEffect(() => {
    fetchDiscrepancies();
  }, []);

  const fetchDiscrepancies = async () => {
    try {
      const res = await shopApi.getPendingDiscrepancies();
      setDiscrepancies(res.data.data || []);
    } catch (error) {
      toast.error('Failed to load discrepancies');
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = (id) => {
    setResolveModal({ open: true, id, notes: '' });
  };

  const confirmResolve = async () => {
    try {
      await shopApi.resolveDiscrepancy(resolveModal.id, { adminNotes: resolveModal.notes });
      toast.success('Discrepancy resolved');
      setResolveModal({ open: false, id: null, notes: '' });
      fetchDiscrepancies();
    } catch (error) {
      toast.error('Failed to resolve');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Stock Discrepancies</h1>
      <Card>
        {loading ? <Skeleton className="h-96" /> : (
          <DataTable columns={columns} data={discrepancies} />
        )}
      </Card>
      
      {resolveModal.open && (
        <Modal isOpen={resolveModal.open} onClose={() => setResolveModal({ open: false, id: null, notes: '' })}>
          <h2 className="text-xl font-bold mb-4">Resolve Discrepancy</h2>
          <Input 
            as="textarea" 
            value={resolveModal.notes} 
            onChange={(e) => setResolveModal({...resolveModal, notes: e.target.value})} 
            placeholder="Admin notes for resolution..." 
            rows="4"
          />
          <div className="flex gap-2 mt-4">
            <Button onClick={confirmResolve} className="bg-green-500 hover:bg-green-600">Resolve</Button>
            <Button variant="outline" onClick={() => setResolveModal({ open: false, id: null, notes: '' })}>Cancel</Button>
          </div>
        </Modal>
      )}
    </div>
  );
};

