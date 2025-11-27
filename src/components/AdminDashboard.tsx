import React, { useEffect, useState } from "react";
import axios from "axios";
import { Check, Star, X, Plus, Save, Trash2, Edit3, Loader2 } from "lucide-react";

interface Plan {
  id: string;
  name: string;
  storage: string;
  price: string;
  originalPrice?: string;
  tagline?: string;
  popular: boolean;
}

const AdminDashboard: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [isAddingPlan, setIsAddingPlan] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editPlan, setEditPlan] = useState<Plan | null>(null);

  const [newPlan, setNewPlan] = useState({
    id: "", name: "", storage: "", price: "", originalPrice: "", tagline: "", popular: false,
  });

  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "info";
    visible: boolean;
  }>({ message: "", type: "success", visible: false });

  const apiUrl = `${import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, "")}/api/plans`;

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type, visible: true });
    setTimeout(() => setToast({ ...toast, visible: false }), 3000);
  };

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const res = await axios.get(apiUrl);
      const data = Array.isArray(res.data) ? res.data : [];
      setPlans(data);
      if (data.length > 0 && !selectedPlan) {
        setSelectedPlan(data[0].id);
        setEditPlan(data[0]);
      }
    } catch (err) {
      showToast("Failed to load plans", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPlans(); }, []);

  useEffect(() => {
    if (selectedPlan) {
      const plan = plans.find(p => p.id === selectedPlan);
      if (plan) setEditPlan({ ...plan });
    }
  }, [selectedPlan, plans]);

  const handleAddPlan = async () => {
    if (!newPlan.id || !newPlan.name) return showToast("ID & Name required!", "error");
    if (plans.some(p => p.id === newPlan.id)) return showToast("ID already exists!", "error");

    try {
      await axios.post(apiUrl, newPlan);
      setNewPlan({ id: "", name: "", storage: "", price: "", originalPrice: "", tagline: "", popular: false });
      setIsAddingPlan(false);
      showToast(`"${newPlan.name}" created!`, "success");
      await fetchPlans();
    } catch (err: any) {
      showToast(err.response?.data?.error || "Failed to create", "error");
    }
  };

  const handleSave = async () => {
    if (!editPlan || !selectedPlan) return;
    const original = plans.find(p => p.id === selectedPlan);
    if (!original || JSON.stringify(editPlan) === JSON.stringify(original)) {
      return showToast("No changes", "info");
    }
    try {
      await axios.put(`${apiUrl}/${selectedPlan}`, editPlan);
      showToast(`"${editPlan.name}" updated!`, "success");
      await fetchPlans();
    } catch (err) {
      showToast("Update failed", "error");
    }
  };

  const handleDelete = async (id: string) => {
    const plan = plans.find(p => p.id === id);
    if (!plan || !confirm(`Delete "${plan.name}" permanently?`)) return;
    try {
      await axios.delete(`${apiUrl}/${id}`);
      showToast(`"${plan.name}" deleted`, "info");
      await fetchPlans();
      if (selectedPlan === id) {
        const remaining = plans.filter(p => p.id !== id);
        setSelectedPlan(remaining[0]?.id || "");
        setEditPlan(remaining[0] || null);
      }
    } catch (err) {
      showToast("Delete failed", "error");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black to-gray-950 flex items-center justify-center">
        <Loader2 className="w-16 h-16 text-yellow-400 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <section className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black text-white">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl font-bold mb-3">Admin Dashboard</h2>
            <p className="text-gray-400 text-lg sm:text-xl">Manage your pricing plans</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* LEFT: Plans List + Add Form */}
            <div className="lg:col-span-8 space-y-8">
              {/* Add Button */}
              {!isAddingPlan && (
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <h3 className="text-2xl sm:text-3xl font-bold">All Plans ({plans.length})</h3>
                  <button
                    onClick={() => setIsAddingPlan(true)}
                    className="flex items-center gap-3 bg-yellow-400 hover:bg-yellow-500 text-black font-bold px-6 py-3 rounded-xl shadow-lg transition text-base sm:text-lg"
                  >
                    <Plus className="w-5 h-5" /> Add New Plan
                  </button>
                </div>
              )}

              {/* Add Form - Inside List Area */}
              {isAddingPlan && (
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 sm:p-8 border-4 border-yellow-400/40 shadow-2xl">
                  <h3 className="text-2xl font-bold mb-6 text-yellow-300">Create New Plan</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {["id", "name", "storage", "price", "originalPrice", "tagline"].map((field) => (
                      <input
                        key={field}
                        placeholder={field === "id" ? "Unique ID" : field.charAt(0).toUpperCase() + field.slice(1).replace("Price", " Price")}
                        value={newPlan[field as keyof typeof newPlan] as string}
                        onChange={(e) => setNewPlan({ ...newPlan, [field]: e.target.value })}
                        className="bg-gray-800 border-2 border-gray-700 rounded-lg px-4 py-3 text-white focus:border-yellow-400 transition"
                      />
                    ))}
                  </div>
                  <div className="mt-6 flex items-center gap-6">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" checked={newPlan.popular} onChange={(e) => setNewPlan({ ...newPlan, popular: e.target.checked })} className="w-6 h-6 rounded accent-yellow-400" />
                      <span className="flex items-center gap-2 text-lg"><Star className="w-6 h-6 text-yellow-400" /> Popular</span>
                    </label>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 mt-8">
                    <button onClick={handleAddPlan} className="flex items-center justify-center gap-3 bg-green-600 hover:bg-green-700 px-8 py-4 rounded-xl font-bold text-lg">
                      <Save className="w-6 h-6" /> Create Plan
                    </button>
                    <button onClick={() => setIsAddingPlan(false)} className="bg-gray-700 hover:bg-gray-600 px-8 py-4 rounded-xl font-bold text-lg">
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Plans List */}
              {plans.length === 0 && !isAddingPlan && (
                <div className="text-center py-20 bg-gray-900/50 rounded-2xl border-2 border-dashed border-gray-700">
                  <p className="text-gray-400 text-xl mb-8">No plans created yet</p>
                  <button onClick={() => setIsAddingPlan(true)} className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold px-10 py-5 rounded-xl text-xl shadow-lg">
                    Create Your First Plan
                  </button>
                </div>
              )}

              <div className="space-y-6">
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan.id)}
                    className={`p-6 sm:p-8 rounded-2xl border-4 cursor-pointer transition-all hover:scale-[1.02] hover:shadow-2xl ${
                      selectedPlan === plan.id
                        ? "border-yellow-400 bg-yellow-400/10 shadow-2xl"
                        : "border-gray-700 bg-gray-800/70 hover:border-gray-600"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="flex items-start gap-5 flex-1">
                        {selectedPlan === plan.id && <Check className="w-7 h-7 text-yellow-400 mt-1 flex-shrink-0" />}
                        <div>
                          <h4 className="text-2xl sm:text-3xl font-bold">{plan.name}</h4>
                          <p className="text-yellow-300 text-base sm:text-lg mt-1">{plan.tagline || "No tagline"}</p>
                          <p className="text-gray-400 text-sm sm:text-base">{plan.storage}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl sm:text-4xl font-bold">{plan.price}</p>
                        {plan.originalPrice && <p className="text-gray-500 line-through text-lg sm:text-xl">{plan.originalPrice}</p>}
                        {plan.popular && <Star className="w-9 h-9 text-yellow-400 mt-2" fill="currentColor" />}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT: Edit Panel - WIDER & STICKY */}
            {selectedPlan && editPlan && (
              <div className="hidden lg:block lg:col-span-4 bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-8 border-4 border-gray-700 sticky top-6 shadow-2xl h-fit max-h-screen overflow-y-auto">
                <h3 className="text-3xl font-bold mb-8 flex items-center gap-4">
                  <Edit3 className="w-10 h-10 text-yellow-400" />
                  Edit Plan
                </h3>

                <div className="space-y-7">
                  {["name", "tagline", "storage", "price", "originalPrice"].map((field) => (
                    <div key={field}>
                      <label className="block text-gray-300 font-medium mb-3 text-lg">
                        {field.charAt(0).toUpperCase() + field.slice(1).replace("Price", " Price")}
                      </label>
                      <input
                        value={(editPlan as any)[field] || ""}
                        onChange={(e) => setEditPlan({ ...editPlan, [field]: e.target.value })}
                        className="w-full bg-gray-700 border-2 border-gray-600 rounded-xl px-5 py-4 text-white text-lg focus:border-yellow-400 transition"
                      />
                    </div>
                  ))}

                  <label className="flex items-center gap-5 cursor-pointer bg-gray-700 p-5 rounded-xl hover:bg-gray-600 transition">
                    <input
                      type="checkbox"
                      checked={editPlan.popular}
                      onChange={(e) => setEditPlan({ ...editPlan, popular: e.target.checked })}
                      className="w-7 h-7 rounded accent-yellow-400"
                    />
                    <span className="text-white text-xl flex items-center gap-3">
                      <Star className="w-8 h-8 text-yellow-400" fill={editPlan.popular ? "currentColor" : "none"} />
                      Popular Plan
                    </span>
                  </label>

                  <button
                    onClick={handleSave}
                    className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-bold py-6 rounded-xl flex items-center justify-center gap-4 text-2xl shadow-xl transition hover:scale-105"
                  >
                    <Save className="w-9 h-9" /> Update Plan
                  </button>

                  <button
                    onClick={() => handleDelete(selectedPlan)}
                    className="w-full bg-red-600 hover:bg-red-700 py-5 rounded-xl flex items-center justify-center gap-4 text-xl"
                  >
                    <Trash2 className="w-8 h-8" /> Delete Plan
                  </button>
                </div>
              </div>
            )}

            {/* Mobile Full-Screen Edit Panel */}
            {selectedPlan && editPlan && (
              <div className="lg:hidden fixed inset-0 z-50 bg-black/95 backdrop-blur-sm overflow-y-auto">
                <div className="sticky top-0 bg-gray-900 p-4 flex items-center justify-between border-b border-gray-800">
                  <button onClick={() => setSelectedPlan("")} className="text-yellow-400 flex items-center gap-2 text-lg">
                    Back
                  </button>
                  <h3 className="text-xl font-bold">Edit Plan</h3>
                </div>
                <div className="p-6 space-y-6">
                  {["name", "tagline", "storage", "price", "originalPrice"].map((field) => (
                    <div key={field}>
                      <label className="block text-gray-300 mb-2">{field.charAt(0).toUpperCase() + field.slice(1).replace("Price", " Price")}</label>
                      <input
                        value={(editPlan as any)[field] || ""}
                        onChange={(e) => setEditPlan({ ...editPlan, [field]: e.target.value })}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-yellow-400"
                      />
                    </div>
                  ))}
                  <label className="flex items-center gap-4">
                    <input type="checkbox" checked={editPlan.popular} onChange={(e) => setEditPlan({ ...editPlan, popular: e.target.checked })} className="w-6 h-6 rounded accent-yellow-400" />
                    <span className="flex items-center gap-2"><Star className="w-6 h-6 text-yellow-400" /> Popular</span>
                  </label>
                  <button onClick={handleSave} className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold py-5 rounded-xl text-xl">
                    Update Plan
                  </button>
                  <button onClick={() => handleDelete(selectedPlan)} className="w-full bg-red-600 py-5 rounded-xl text-xl">
                    Delete Plan
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Toast */}
      {toast.visible && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <div className={`flex items-center gap-4 px-8 py-5 rounded-2xl shadow-2xl text-white font-bold text-xl border-4 animate-bounce-in ${
            toast.type === "success" ? "bg-green-600 border-green-400" :
            toast.type === "error" ? "bg-red-600 border-red-400" :
            "bg-blue-600 border-blue-400"
          }`}>
            {toast.type === "success" && <Check className="w-9 h-9" />}
            {toast.type === "error" && <X className="w-9 h-9" />}
            {toast.type === "info" && <Trash2 className="w-9 h-9" />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminDashboard;