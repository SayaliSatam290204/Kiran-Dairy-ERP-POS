import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FaPlus, FaEdit, FaTrash, FaSearch } from 'react-icons/fa';
import { Card } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Skeleton } from '../../components/ui/Skeleton.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { adminApi } from '../../api/adminApi.js';
import { formatCurrency } from '../../utils/formatCurrency.js';

export const Products = () => {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [categories, setCategories] = useState(['All']);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // ✅ NEW: Toggle view
  const [gridView, setGridView] = useState(true);

  // Server base
  const getServerBase = () => {
    const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
    return apiUrl.replace(/\/api\/?$/, '');
  };

  const SERVER_BASE = getServerBase();
  const FALLBACK_IMG = 'https://dummyimage.com/200x200/e5e7eb/111827.png?text=No+Image';

  const getProductImage = (product) => {
    const image = product?.imageUrl || product?.image || product?.images?.[0] || '';
    if (!image) return FALLBACK_IMG;
    if (image.startsWith('/')) return `${SERVER_BASE}${image}`;
    if (image.startsWith('http')) return image;
    return FALLBACK_IMG;
  };

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [prodRes, catRes] = await Promise.all([
          adminApi.getAllProducts(),
          adminApi.getCategories()
        ]);

        const prodData = prodRes.data?.data || [];
        const catData = catRes.data?.data || [];

        setProducts(prodData);
        setCategories(['All', ...catData.map(c => c.name)]);
        filterProducts(prodData, searchQuery, selectedCategory);
      } catch (error) {
        console.error(error);
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter
  const filterProducts = (productList, query, category) => {
    let filtered = productList;

    if (category !== 'All') {
      filtered = filtered.filter(p => p.category === category);
    }

    if (query.trim()) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.sku.toLowerCase().includes(query.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  };

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    filterProducts(products, query, selectedCategory);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    filterProducts(products, searchQuery, category);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      setDeleting(true);
      // await adminApi.deleteProduct(deleteTarget._id);
      toast.success('Deleted');
      setProducts(prev => prev.filter(p => p._id !== deleteTarget._id));
      setFilteredProducts(prev => prev.filter(p => p._id !== deleteTarget._id));
    } catch (err) {
      toast.error('Delete failed');
    } finally {
      setDeleting(false);
      setDeleteConfirmOpen(false);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Products</h1>

        <div className="flex gap-2">
          <Button
            onClick={() => setGridView(true)}
            className={`px-4 py-2 rounded ${gridView ? 'bg-blue-600 text-white' : 'bg-gray-100 text-slate-700 hover:bg-gray-200'}`}
          >
            Grid
          </Button>

          <Button
            onClick={() => setGridView(false)}
            className={`px-4 py-2 rounded ${!gridView ? 'bg-blue-600 text-white' : 'bg-gray-100 text-slate-700 hover:bg-gray-200'}`}
          >
            Compact
          </Button>

          <Button
            onClick={() => navigate('/admin/products/create')}
            className="bg-blue-600 text-white flex gap-2"
          >
            <FaPlus /> Add
          </Button>
        </div>
      </div>

      {/* SEARCH */}
      <Card className="p-4">
        <div className="relative">
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={handleSearch}
            className="w-full pl-10 p-2 border rounded"
          />
        </div>

        <div className="flex gap-2 mt-3 flex-wrap">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`px-3 py-1 rounded ${selectedCategory === cat ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </Card>

      {/* PRODUCT LIST */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
          {[...Array(12)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : gridView ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
          {filteredProducts.map(product => (
            <div
              key={product._id}
              className="relative group border border-gray-200 bg-white rounded-lg p-3 transition-all duration-200 hover:border-blue-300 hover:bg-gray-50"
            >
              <div className="flex flex-col h-full">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <img
                      src={getProductImage(product)}
                      alt={product.name}
                      className="w-12 h-12 rounded object-cover"
                      onError={(e) => {
                        e.target.src = FALLBACK_IMG;
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-slate-900 truncate">
                      {product.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-1 truncate">
                      SKU: {product.sku}
                    </p>
                  </div>
                </div>

                <div className="mt-3 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600">
                      <span className={`h-2 w-2 rounded-full ${product.isActive ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                      {product.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600">
                      {product.category}
                    </span>
                    {product.subcategory && (
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600">
                        {product.subcategory}
                      </span>
                    )}
                  </div>
                  <p className="text-[12px] leading-5 text-slate-600 line-clamp-2 min-h-[2.5rem]">
                    {product.description}
                  </p>
                </div>

                <div className="mt-auto flex items-center justify-between gap-2 pt-3 border-t border-slate-100">
                  <span className="text-sm font-semibold text-slate-900">
                    {formatCurrency(product.effectivePrice || product.price)}
                  </span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      onClick={() => navigate(`/admin/products/${product._id}`)}
                      className="rounded p-1 text-gray-400 hover:text-blue-600 transition-colors"
                      title="Edit"
                    >
                      <FaEdit size={14} />
                    </button>
                    <button
                      onClick={() => {
                        setDeleteTarget(product);
                        setDeleteConfirmOpen(true);
                      }}
                      className="rounded p-1 text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete"
                    >
                      <FaTrash size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredProducts.map(product => (
            <div
              key={product._id}
              className="flex flex-col gap-3 border border-gray-200 bg-white rounded-lg p-3 transition-all duration-200 hover:border-blue-300 hover:bg-gray-50 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={getProductImage(product)}
                  alt={product.name}
                  className="w-14 h-14 rounded object-cover"
                  onError={(e) => {
                    e.target.src = FALLBACK_IMG;
                  }}
                />

                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-slate-900 truncate">
                    {product.name}
                  </h3>
                  <p className="text-[11px] text-slate-500 truncate">
                    SKU: {product.sku}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600">
                      <span className={`h-2 w-2 rounded-full ${product.isActive ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                      {product.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600">
                      {product.category}
                    </span>
                    {product.subcategory && (
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600">
                        {product.subcategory}
                      </span>
                    )}
                  </div>
                  <p className="text-[12px] leading-5 text-slate-600 line-clamp-2 mt-2">
                    {product.description}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:items-end sm:text-right">
                <span className="text-sm font-semibold text-slate-900">
                  {formatCurrency(product.price)}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate(`/admin/products/${product._id}`)}
                    className="rounded p-2 text-gray-500 hover:text-blue-600 transition-colors"
                    title="Edit"
                  >
                    <FaEdit size={14} />
                  </button>
                  <button
                    onClick={() => {
                      setDeleteTarget(product);
                      setDeleteConfirmOpen(true);
                    }}
                    className="rounded p-2 text-gray-500 hover:text-red-600 transition-colors"
                    title="Delete"
                  >
                    <FaTrash size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* DELETE MODAL */}
      <Modal isOpen={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <p>Delete {deleteTarget?.name}?</p>

        <div className="flex gap-2 mt-3">
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} className="bg-red-600 text-white">
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </Modal>

    </div>
  );
};