import { useState } from "react";
import API from "../services/api";
import { toast } from 'react-hot-toast'; // ✅ ADD THIS


function UserForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: ""
  });
  const [loading, setLoading] = useState(false); // ✅ ADD THIS LINE
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await API.post("/users", formData);
      toast.success("User created successfully!"); // ✅ REPLACE alert
      setFormData({ name: "", email: "" });
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.error || "Failed to create user"); // ✅ REPLACE alert
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-5">Create User</h2>
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="w-full p-2 border rounded-lg"
            required
            disabled={loading}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            className="w-full p-2 border rounded-lg"
            required
            disabled={loading}
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-medium disabled:opacity-50"
        >
          {loading ? "Creating User..." : "Create User"}
        </button>
      </form>
    </div>
  );
}

export default UserForm;