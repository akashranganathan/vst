import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Check,
  Star,
  X,
  Plus,
  Save,
  Trash2,
  Edit3,
  Loader2,
} from "lucide-react";

interface Plan {
  _id?: string;
  id: string;
  name: string;
  storage: string;
  priceIndia: string;
  priceForeign: string;
  originalPrice?: string;
  tagline?: string;
  popular: boolean;
  features: string[];
}

const AdminDashboard: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [isAddingPlan, setIsAddingPlan] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editPlan, setEditPlan] = useState<Plan | null>(null);

  // For new plan
  const [newPlan, setNewPlan] = useState<Plan>({
    id: "",
    name: "",
    storage: "",
    priceIndia: "",
    priceForeign: "",
    originalPrice: "",
    tagline: "",
    popular: false,
    features: [],
  });
  const [newFeatureInput, setNewFeatureInput] = useState("");

  // For editing
  const [editFeatureInput, setEditFeatureInput] = useState("");

  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "info";
    visible: boolean;
  }>({ message: "", type: "success", visible: false });

  const apiUrl = `${import.meta.env.VITE_API_BASE_URL?.replace(
    /\/+$/,
    ""
  )}/api/plans`;

  const showToast = (
    message: string,
    type: "success" | "error" | "info" = "success"
  ) => {
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

  useEffect(() => {
    fetchPlans();
  }, []);

  useEffect(() => {
    if (selectedPlan) {
      const plan = plans.find((p) => p.id === selectedPlan);
      if (plan) {
        setEditPlan({ ...plan });
        setEditFeatureInput("");
      }
    }
  }, [selectedPlan, plans]);

  const addNewFeature = () => {
    const trimmed = newFeatureInput.trim();
    if (trimmed && !newPlan.features.includes(trimmed)) {
      setNewPlan({ ...newPlan, features: [...newPlan.features, trimmed] });
      setNewFeatureInput("");
    }
  };

  const removeNewFeature = (index: number) => {
    setNewPlan({
      ...newPlan,
      features: newPlan.features.filter((_, i) => i !== index),
    });
  };

  const addEditFeature = () => {
    if (!editPlan) return;
    const trimmed = editFeatureInput.trim();
    if (trimmed && !editPlan.features.includes(trimmed)) {
      setEditPlan({ ...editPlan, features: [...editPlan.features, trimmed] });
      setEditFeatureInput("");
    }
  };

  const removeEditFeature = (index: number) => {
    if (!editPlan) return;
    setEditPlan({
      ...editPlan,
      features: editPlan.features.filter((_, i) => i !== index),
    });
  };

  const handleAddPlan = async () => {
    if (
      !newPlan.id ||
      !newPlan.name ||
      !newPlan.priceIndia ||
      !newPlan.priceForeign
    ) {
      return showToast("ID, Name, India & Foreign Price required!", "error");
    }
    if (plans.some((p) => p.id === newPlan.id)) {
      return showToast("Plan ID already exists!", "error");
    }

    try {
      await axios.post(apiUrl, newPlan);
      setNewPlan({
        id: "",
        name: "",
        storage: "",
        priceIndia: "",
        priceForeign: "",
        originalPrice: "",
        tagline: "",
        popular: false,
        features: [],
      });
      setNewFeatureInput("");
      setIsAddingPlan(false);
      showToast(`"${newPlan.name}" created successfully!`, "success");
      await fetchPlans();
    } catch (err: any) {
      showToast(err.response?.data?.error || "Failed to create plan", "error");
    }
  };

  const handleSave = async () => {
    if (!editPlan || !selectedPlan) return;
    const original = plans.find((p) => p.id === selectedPlan);
    if (!original || JSON.stringify(editPlan) === JSON.stringify(original)) {
      return showToast("No changes detected", "info");
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
    const plan = plans.find((p) => p.id === id);
    if (!plan || !confirm(`Permanently delete "${plan.name}"?`)) return;

    try {
      await axios.delete(`${apiUrl}/${id}`);
      showToast(`"${plan.name}" deleted`, "info");
      await fetchPlans();
      if (selectedPlan === id) {
        const remaining = plans.filter((p) => p.id !== id);
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
            <h2 className="text-4xl sm:text-5xl font-bold mb-3">
              Admin Dashboard
            </h2>
            <p className="text-gray-400 text-lg sm:text-xl">
              Manage pricing plans & features
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left: List + Add Form */}
            <div className="lg:col-span-8 space-y-8">
              {!isAddingPlan && (
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <h3 className="text-2xl sm:text-3xl font-bold">
                    All Plans ({plans.length})
                  </h3>
                  <button
                    onClick={() => setIsAddingPlan(true)}
                    className="flex items-center gap-3 bg-yellow-400 hover:bg-yellow-500 text-black font-bold px-6 py-3 rounded-xl shadow-lg transition text-base"
                  >
                    <Plus className="w-5 h-5" /> Add New Plan
                  </button>
                </div>
              )}

              {/* Add New Plan Form */}
              {isAddingPlan && (
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 sm:p-8 border-4 border-yellow-400/40 shadow-2xl">
                  <h3 className="text-2xl font-bold mb-6 text-yellow-300">
                    Create New Plan
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                      placeholder="Unique ID (e.g. studio)"
                      value={newPlan.id}
                      onChange={(e) =>
                        setNewPlan({ ...newPlan, id: e.target.value })
                      }
                      className="bg-gray-800 border-2 border-gray-700 rounded-lg px-4 py-3 text-white text-sm sm:text-base"
                    />
                    <input
                      placeholder="Plan Name"
                      value={newPlan.name}
                      onChange={(e) =>
                        setNewPlan({ ...newPlan, name: e.target.value })
                      }
                      className="bg-gray-800 border-2 border-gray-700 rounded-lg px-4 py-3 text-white text-sm sm:text-base"
                    />
                    <input
                      placeholder="Storage (e.g. 2TB)"
                      value={newPlan.storage}
                      onChange={(e) =>
                        setNewPlan({ ...newPlan, storage: e.target.value })
                      }
                      className="bg-gray-800 border-2 border-gray-700 rounded-lg px-4 py-3 text-white text-sm sm:text-base"
                    />
                    <input
                      placeholder="Price India (e.g. ₹18,499/-)"
                      value={newPlan.priceIndia}
                      onChange={(e) =>
                        setNewPlan({ ...newPlan, priceIndia: e.target.value })
                      }
                      className="bg-gray-800 border-2 border-gray-700 rounded-lg px-4 py-3 text-white text-sm sm:text-base"
                    />
                    <input
                      placeholder="Price Foreign (e.g. $244/-)"
                      value={newPlan.priceForeign}
                      onChange={(e) =>
                        setNewPlan({ ...newPlan, priceForeign: e.target.value })
                      }
                      className="bg-gray-800 border-2 border-gray-700 rounded-lg px-4 py-3 text-white text-sm sm:text-base"
                    />
                    <input
                      placeholder="Original Price (optional)"
                      value={newPlan.originalPrice}
                      onChange={(e) =>
                        setNewPlan({
                          ...newPlan,
                          originalPrice: e.target.value,
                        })
                      }
                      className="bg-gray-800 border-2 border-gray-700 rounded-lg px-4 py-3 text-white text-sm sm:text-base"
                    />
                    <input
                      placeholder="Tagline"
                      value={newPlan.tagline}
                      onChange={(e) =>
                        setNewPlan({ ...newPlan, tagline: e.target.value })
                      }
                      className="bg-gray-800 border-2 border-gray-700 rounded-lg px-4 py-3 text-white text-sm sm:text-base sm:col-span-2"
                    />
                  </div>

                  {/* Features: 70% input + 30% button (mobile stacked) */}
                  <div className="mt-6">
                    <label className="block text-lg font-medium mb-3">
                      Features
                    </label>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <input
                        type="text"
                        value={newFeatureInput}
                        onChange={(e) => setNewFeatureInput(e.target.value)}
                        onKeyDown={(e) =>
                          e.key === "Enter" &&
                          (e.preventDefault(), addNewFeature())
                        }
                        placeholder="Enter a feature..."
                        className="flex-1 sm:flex-[0_0_70%] bg-gray-800 border-2 border-gray-700 rounded-lg px-4 py-3 text-white text-sm sm:text-base order-1"
                      />
                      <button
                        onClick={addNewFeature}
                        className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold px-6 py-3 rounded-lg flex items-center justify-center gap-2 order-2 sm:order-3 sm:flex-[0_0_28%]"
                      >
                        <Plus className="w-5 h-5" /> Add
                      </button>
                    </div>

                    {/* Feature List */}
                    {newPlan.features.length > 0 && (
                      <div className="mt-4 space-y-2">
                        {newPlan.features.map((feature, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center bg-gray-700/50 rounded-lg px-4 py-3"
                          >
                            <span className="text-gray-200 text-sm sm:text-base">
                              {feature}
                            </span>
                            <button
                              onClick={() => removeNewFeature(index)}
                              className="text-red-400 hover:text-red-300 transition"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="mt-6 flex items-center gap-6">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newPlan.popular}
                        onChange={(e) =>
                          setNewPlan({ ...newPlan, popular: e.target.checked })
                        }
                        className="w-6 h-6 rounded accent-yellow-400"
                      />
                      <span className="flex items-center gap-2 text-lg">
                        <Star className="w-6 h-6 text-yellow-400" /> Popular
                      </span>
                    </label>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 mt-8">
                    <button
                      onClick={handleAddPlan}
                      className="flex items-center justify-center gap-3 bg-green-600 hover:bg-green-700 px-8 py-4 rounded-xl font-bold text-lg order-1"
                    >
                      <Save className="w-6 h-6" /> Create Plan
                    </button>
                    <button
                      onClick={() => setIsAddingPlan(false)}
                      className="bg-gray-700 hover:bg-gray-600 px-8 py-4 rounded-xl font-bold text-lg order-2"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Plans List */}
              <div className="space-y-6">
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan.id)}
                    className={`p-6 rounded-2xl border-4 cursor-pointer transition-all hover:scale-[1.02] ${
                      selectedPlan === plan.id
                        ? "border-yellow-400 bg-yellow-400/10"
                        : "border-gray-700 bg-gray-800/70"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                      <div>
                        <h4 className="text-2xl font-bold">{plan.name}</h4>
                        {plan.tagline && (
                          <p className="text-yellow-300 text-lg">
                            {plan.tagline}
                          </p>
                        )}
                        <p className="text-sm text-gray-400 mt-1">
                          India: {plan.priceIndia} | Foreign:{" "}
                          {plan.priceForeign}
                        </p>
                      </div>
                      {plan.popular && (
                        <Star
                          className="w-8 h-8 text-yellow-400"
                          fill="currentColor"
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Edit Panel (Hidden on mobile, full-screen overlay) */}
            {selectedPlan && editPlan && (
              <>
                {/* Desktop Edit Panel */}
                <div className="hidden lg:block lg:col-span-4 bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-8 border-4 border-gray-700 sticky top-6 h-fit max-h-screen overflow-y-auto">
                  <h3 className="text-3xl font-bold mb-8 flex items-center gap-4">
                    <Edit3 className="w-10 h-10 text-yellow-400" /> Edit Plan
                  </h3>

                  <div className="space-y-6">
                    {[
                      "name",
                      "storage",
                      "priceIndia",
                      "priceForeign",
                      "originalPrice",
                      "tagline",
                    ].map((field) => (
                      <div key={field}>
                        <label className="block text-gray-300 font-medium mb-2 text-sm">
                          {field === "priceIndia"
                            ? "Price (India)"
                            : field === "priceForeign"
                            ? "Price (Foreign)"
                            : field.charAt(0).toUpperCase() +
                              field.slice(1).replace("Price", " Price")}
                        </label>
                        <input
                          value={(editPlan as any)[field] || ""}
                          onChange={(e) =>
                            setEditPlan({
                              ...editPlan,
                              [field]: e.target.value,
                            })
                          }
                          className="w-full bg-gray-700 border-2 border-gray-600 rounded-xl px-5 py-4 text-white"
                        />
                      </div>
                    ))}

                    {/* Edit Features */}
                    <div>
                      <label className="block text-gray-300 font-medium mb-3">
                        Features
                      </label>
                      <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
                        <input
                          type="text"
                          value={editFeatureInput}
                          onChange={(e) => setEditFeatureInput(e.target.value)}
                          onKeyDown={(e) =>
                            e.key === "Enter" &&
                            (e.preventDefault(), addEditFeature())
                          }
                          placeholder="Add a new feature..."
                          className="flex-1 w-full bg-gray-700 border-2 border-gray-600 rounded-xl px-5 py-4 text-white"
                        />
                        <button
                          onClick={addEditFeature}
                          className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold px-6 py-4 rounded-xl flex items-center justify-center gap-2 w-full"
                        >
                          <Plus className="w-5 h-5" /> Add
                        </button>
                      </div>

                      {editPlan.features.length > 0 && (
                        <div className="mt-4 space-y-2 max-h-60 overflow-y-auto">
                          {editPlan.features.map((feature, index) => (
                            <div
                              key={index}
                              className="flex justify-between items-center bg-gray-700/50 rounded-lg px-4 py-3"
                            >
                              <span className="text-gray-200">{feature}</span>
                              <button
                                onClick={() => removeEditFeature(index)}
                                className="text-red-400 hover:text-red-300"
                              >
                                <X className="w-5 h-5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <label className="flex items-center gap-5 cursor-pointer bg-gray-700 p-5 rounded-xl">
                      <input
                        type="checkbox"
                        checked={editPlan.popular}
                        onChange={(e) =>
                          setEditPlan({
                            ...editPlan,
                            popular: e.target.checked,
                          })
                        }
                        className="w-7 h-7 rounded accent-yellow-400"
                      />
                      <span className="text-xl flex items-center gap-3">
                        <Star
                          className="w-8 h-8 text-yellow-400"
                          fill={editPlan.popular ? "currentColor" : "none"}
                        />
                        Popular Plan
                      </span>
                    </label>

                    <button
                      onClick={handleSave}
                      className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-bold py-6 rounded-xl flex items-center justify-center gap-4 text-2xl shadow-xl transition"
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

                {/* Mobile Full-Screen Edit Overlay */}
                <div className="lg:hidden fixed inset-0 z-50 bg-black/95 backdrop-blur-sm overflow-y-auto">
                  <div className="sticky top-0 bg-gray-900 p-4 flex items-center justify-between border-b border-gray-800">
                    <button
                      onClick={() => setSelectedPlan("")}
                      className="text-yellow-400 flex items-center gap-2 text-lg"
                    >
                      ← Back
                    </button>
                    <h3 className="text-xl font-bold">Edit Plan</h3>
                  </div>
                  <div className="p-6 space-y-6">
                    {[
                      "name",
                      "storage",
                      "priceIndia",
                      "priceForeign",
                      "originalPrice",
                      "tagline",
                    ].map((field) => (
                      <div key={field}>
                        <label className="block text-gray-300 mb-2 text-sm">
                          {field === "priceIndia"
                            ? "Price (India)"
                            : field === "priceForeign"
                            ? "Price (Foreign)"
                            : field.charAt(0).toUpperCase() +
                              field.slice(1).replace("Price", " Price")}
                        </label>
                        <input
                          value={(editPlan as any)[field] || ""}
                          onChange={(e) =>
                            setEditPlan({
                              ...editPlan,
                              [field]: e.target.value,
                            })
                          }
                          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white"
                        />
                      </div>
                    ))}

                    <div>
                      <label className="block text-gray-300 mb-3">
                        Features
                      </label>
                      <div className="flex flex-col gap-3">
                        <input
                          type="text"
                          value={editFeatureInput}
                          onChange={(e) => setEditFeatureInput(e.target.value)}
                          onKeyDown={(e) =>
                            e.key === "Enter" &&
                            (e.preventDefault(), addEditFeature())
                          }
                          placeholder="Add a new feature..."
                          className="flex-1 bg-gray-800 border-2 border-gray-700 rounded-lg px-4 py-3 text-white"
                        />
                        <button
                          onClick={addEditFeature}
                          className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold px-6 py-4 rounded-lg flex items-center justify-center gap-2"
                        >
                          <Plus className="w-5 h-5" /> Add Feature
                        </button>
                      </div>

                      {editPlan.features.length > 0 && (
                        <div className="mt-4 space-y-2">
                          {editPlan.features.map((feature, index) => (
                            <div
                              key={index}
                              className="flex justify-between items-center bg-gray-700/50 rounded-lg px-4 py-3"
                            >
                              <span className="text-gray-200">{feature}</span>
                              <button
                                onClick={() => removeEditFeature(index)}
                                className="text-red-400 hover:text-red-300"
                              >
                                <X className="w-5 h-5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <label className="flex items-center gap-4">
                      <input
                        type="checkbox"
                        checked={editPlan.popular}
                        onChange={(e) =>
                          setEditPlan({
                            ...editPlan,
                            popular: e.target.checked,
                          })
                        }
                        className="w-6 h-6 rounded accent-yellow-400"
                      />
                      <span className="flex items-center gap-2">
                        <Star className="w-6 h-6 text-yellow-400" />
                        Popular Plan
                      </span>
                    </label>

                    <button
                      onClick={handleSave}
                      className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold py-5 rounded-xl text-xl"
                    >
                      Update Plan
                    </button>
                    <button
                      onClick={() => handleDelete(selectedPlan)}
                      className="w-full bg-red-600 py-5 rounded-xl text-xl"
                    >
                      Delete Plan
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Toast */}
      {toast.visible && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <div
            className={`flex items-center gap-4 px-8 py-5 rounded-2xl shadow-2xl text-white font-bold text-xl border-4 ${
              toast.type === "success"
                ? "bg-green-600 border-green-400"
                : toast.type === "error"
                ? "bg-red-600 border-red.times new roman-400"
                : "bg-blue-600 border-blue-400"
            }`}
          >
            {toast.type === "success" && <Check className="w-9 h-9" />}
            {toast.type === "error" && <X className="w-9 h-9" />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminDashboard;
