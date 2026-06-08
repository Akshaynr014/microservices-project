import { useState } from "react";
import API from "../services/api";
import { toast } from 'react-hot-toast';

function ProductForm() {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: ""
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await API.post("/products", {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock)
      });
      toast.success("Product created successfully!");
      setFormData({ name: "", description: "", price: "", stock: "" });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-xl p-5 border border-slate-200/50">
      <h2 className="text-xl font-bold text-slate-700 mb-4 flex items-center">
        <span className="mr-2">➕</span> Add New Product
      </h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm text-slate-600 mb-1">Product Name *</label>
          <input
            type="text"
            placeholder="Enter product name"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
            required
            disabled={loading}
          />
        </div>
        
        <div>
          <label className="block text-sm text-slate-600 mb-1">Description</label>
          <textarea
            placeholder="Enter product description"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
            rows="3"
            disabled={loading}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-slate-600 mb-1">Price *</label>
            <input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formData.price}
              onChange={(e) => setFormData({...formData, price: e.target.value})}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
              required
              disabled={loading}
            />
          </div>
          
          <div>
            <label className="block text-sm text-slate-600 mb-1">Stock *</label>
            <input
              type="number"
              placeholder="Quantity"
              value={formData.stock}
              onChange={(e) => setFormData({...formData, stock: e.target.value})}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
              required
              disabled={loading}
            />
          </div>
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-2 rounded-lg font-medium transition disabled:opacity-50"
        >
          {loading ? "⏳ Creating..." : "✅ Create Product"}
        </button>
      </form>
    </div>
  );
}

export default ProductForm;