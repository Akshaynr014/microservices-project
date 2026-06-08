import { useEffect, useState } from "react";
import API from "../services/api";
import { toast } from 'react-hot-toast'; // ✅ ADD THIS


function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null); // ✅ ADD AT TOP WITH OTHER STATES
  const [searchTerm, setSearchTerm] = useState("");
  

   const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await API.get("/users");
      setUsers(response.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load users"); // ✅ REPLACE console.error
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => 
  user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
  user.email.toLowerCase().includes(searchTerm.toLowerCase())
);

 const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        await API.delete(`/users/${id}`);
        loadUsers();
        toast.success(`User "${name}" deleted successfully!`); // ✅ REPLACE alert
      } catch (error) {
        console.error(error);
        toast.error(error.response?.data?.error || "Failed to delete user"); // ✅ REPLACE alert
      }
    }
  };

  // ✅ ADD THIS UPDATE FUNCTION
   const handleUpdate = async () => {
    try {
      await API.put(`/users/${editingUser.id}`, {
        name: editingUser.name,
        email: editingUser.email
      });
      setEditingUser(null);
      loadUsers();
      toast.success("User updated successfully!"); // ✅ REPLACE alert
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.error || "Failed to update user"); // ✅ REPLACE alert
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-6">
        <div className="text-center py-8 text-gray-500">Loading users...</div>
      </div>
    );
  }

  return (
    <>
      {/* ✅ ADD EDIT MODAL HERE (before the main div) */}
      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-xl font-bold mb-4">Edit User</h3>
            <input 
              value={editingUser.name}
              onChange={(e) => setEditingUser({...editingUser, name: e.target.value})}
              className="w-full p-2 border rounded mb-2"
              placeholder="Name"
            />
            <input 
              value={editingUser.email}
              onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
              className="w-full p-2 border rounded mb-4"
              placeholder="Email"
            />
            <div className="flex gap-2">
              <button 
                onClick={handleUpdate} 
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
              >
                Save Changes
              </button>
              <button 
                onClick={() => setEditingUser(null)} 
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Your existing main content */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-2xl font-bold text-gray-800">
            Users 
            <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded ml-2">
              {users.length} total
            </span>
          </h2>
          <button
            onClick={loadUsers}
            className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg text-sm font-medium"
          >
            Refresh
          </button>
        </div>

        <div className="mb-4">
  <input
    type="text"
    placeholder="🔍 Search by name or email..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
  />
</div>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-100">
                <th className="text-left p-3 font-semibold">ID</th>
                <th className="text-left p-3 font-semibold">Name</th>
                <th className="text-left p-3 font-semibold">Email</th>
                <th className="text-left p-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
{filteredUsers.length > 0 ? (
  filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-slate-50 transition">
                    <td className="p-3">{user.id}</td>
                    <td className="p-3">{user.name}</td>
                    <td className="p-3">{user.email}</td>
                    <td className="p-3">
                      {/* ✅ ADD EDIT BUTTON */}
                      <button
                        onClick={() => setEditingUser(user)}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded-lg text-sm font-medium mr-2"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-sm font-medium"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center p-6 text-gray-500">
                    No Users Found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default UserList;