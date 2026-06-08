import { useEffect, useState } from "react";
import API from "../services/api";
import { toast } from 'react-hot-toast';

function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const response = await API.get("/products");
      setProducts(response.data);
    } catch (error) {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Delete product "${name}"?`)) {
      try {
        await API.delete(`/products/${id}`);
        loadProducts();
        toast.success("Product deleted successfully!");
      } catch (error) {
        toast.error("Failed to delete product");
      }
    }
  };

  const handleUpdate = async () => {
    try {
      await API.put(`/products/${editingProduct.id}`, {
        name: editingProduct.name,
        description: editingProduct.description,
        price: parseFloat(editingProduct.price),
        stock: parseInt(editingProduct.stock)
      });
      setEditingProduct(null);
      loadProducts();
      toast.success("Product updated successfully!");
    } catch (error) {
      toast.error("Failed to update product");
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  if (loading) {
    return (
      <div className="bg-white/60 backdrop-blur-sm rounded-xl p-5 border border-slate-200/50">
        <div className="text-center py-8 text-slate-500">Loading products...</div>
      </div>
    );
  }

  return (
    <>
      {/* Edit Modal */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-96">
            <h3 className="text-xl font-bold mb-4">Edit Product</h3>
            <input
              type="text"
              value={editingProduct.name}
              onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
              className="w-full p-2 border rounded mb-2"
              placeholder="Product Name"
            />
            <textarea
              value={editingProduct.description}
              onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})}
              className="w-full p-2 border rounded mb-2"
              placeholder="Description"
              rows="2"
            />
            <input
              type="number"
              step="0.01"
              value={editingProduct.price}
              onChange={(e) => setEditingProduct({...editingProduct, price: e.target.value})}
              className="w-full p-2 border rounded mb-2"
              placeholder="Price"
            />
            <input
              type="number"
              value={editingProduct.stock}
              onChange={(e) => setEditingProduct({...editingProduct, stock: e.target.value})}
              className="w-full p-2 border rounded mb-4"
              placeholder="Stock"
            />
            <div className="flex gap-2">
              <button onClick={handleUpdate} className="bg-blue-500 text-white px-4 py-2 rounded">Save</button>
              <button onClick={() => setEditingProduct(null)} className="bg-gray-500 text-white px-4 py-2 rounded">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Main Product List */}
      <div className="bg-white/60 backdrop-blur-sm rounded-xl p-5 border border-slate-200/50">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-slate-700 flex items-center">
            <span className="mr-2">📦</span>
            Products 
            <span className="text-sm bg-indigo-100 text-indigo-700 px-2 py-1 rounded ml-2">
              {products.length} total
            </span>
          </h2>
          <button
            onClick={loadProducts}
            className="bg-slate-100 hover:bg-slate-200 px-3 py-1 rounded-lg text-sm transition"
          >
            🔄 Refresh
          </button>
        </div>

        <div className="grid gap-3">
          {products.length > 0 ? (
            products.map((product) => (
              <div key={product.id} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-bold text-slate-800 text-lg">{product.name}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${product.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {product.stock > 0 ? `In Stock: ${product.stock}` : 'Out of Stock'}
                      </span>
                    </div>
                    <p className="text-slate-500 text-sm mb-2">{product.description || "No description"}</p>
                    <div className="flex gap-4 text-sm">
                      <span className="text-indigo-600 font-bold">💰 ${product.price.toFixed(2)}</span>
                      <span className="text-slate-500">📦 Stock: {product.stock}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingProduct(product)}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded-lg text-sm transition"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product.id, product.name)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-sm transition"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-slate-400">
              No products found. Create your first product!
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default ProductList;