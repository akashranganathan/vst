// src/components/VSTLitsDashboard.jsx
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import {
  Check,
  X,
  Plus,
  Save,
  Trash2,
  Edit3,
  Loader2,
  GripVertical,
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Item {
  name: string;
  isActive?: boolean;
}

interface Section {
  _id?: string;
  heading: string;
  order: number;
  items: Item[];
}

const SortableSection = ({
  section,
  onEdit,
  onDelete,
}: {
  section: Section & { id: string };
  onEdit: (section: Section & { id: string }) => void;
  onDelete: (id: string) => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative p-5 sm:p-6 rounded-2xl border-4 bg-gray-800/70 border-gray-700 touch-manipulation ${
        isDragging ? "border-yellow-400 shadow-2xl" : "hover:border-gray-600"
      } transition-all`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        <div
          {...attributes}
          {...listeners}
          className="absolute top-4 left-4 sm:static sm:mt-1 cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="w-7 h-7 sm:w-6 sm:h-6 text-gray-500" />
        </div>

        <div className="flex-1 pl-10 sm:pl-0">
          <h4 className="text-xl sm:text-2xl font-bold break-words">
            {section.heading}
          </h4>
          <p className="text-gray-400 text-sm sm:text-base mt-2">
            {section.items.length} item{section.items.length !== 1 ? "s" : ""}
          </p>
          <ul className="mt-4 space-y-2 text-sm sm:text-base">
            {section.items.slice(0, 5).map((item, idx) => (
              <li key={idx} className="text-gray-300 break-words">
                • {item.name}
              </li>
            ))}
            {section.items.length > 5 && (
              <li className="text-gray-500 italic text-sm">
                ...and {section.items.length - 5} more
              </li>
            )}
          </ul>
        </div>

        <div className="flex gap-3 self-start sm:self-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(section);
            }}
            className="p-3 bg-blue-600 hover:bg-blue-700 rounded-xl touch-manipulation"
            aria-label="Edit"
          >
            <Edit3 className="w-5 h-5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(section.id);
            }}
            className="p-3 bg-red-600 hover:bg-red-700 rounded-xl touch-manipulation"
            aria-label="Delete"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

const VSTLitsDashboard: React.FC = () => {
  const [sections, setSections] = useState<(Section & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingSection, setEditingSection] = useState<
    (Section & { id: string }) | null
  >(null);

  const [newSectionHeading, setNewSectionHeading] = useState("");
  const [newSectionItems, setNewSectionItems] = useState<Item[]>([]);
  const [currentItemInput, setCurrentItemInput] = useState("");

  const [editingItems, setEditingItems] = useState<Item[]>([]);
  const itemInputRef = useRef<HTMLInputElement>(null);

  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "info";
    visible: boolean;
  }>({ message: "", type: "success", visible: false });

  const apiUrl = `${import.meta.env.VITE_API_BASE_URL?.replace(
    /\/+$/,
    ""
  )}/api/lists`;

  const showToast = (
    message: string,
    type: "success" | "error" | "info" = "success"
  ) => {
    setToast({ message, type, visible: true });
    setTimeout(() => setToast({ ...toast, visible: false }), 3000);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(apiUrl);
      const sorted = res.data.sections
        .map((s: Section, index: number) => ({
          ...s,
          id: s._id || `temp-${index}`,
        }))
        .sort((a: any, b: any) => a.order - b.order);
      setSections(sorted);
    } catch (err) {
      showToast("Failed to load VST lists", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = sections.findIndex((s) => s.id === active.id);
    const newIndex = sections.findIndex((s) => s.id === over.id);

    const newSections = arrayMove(sections, oldIndex, newIndex).map(
      (sec, idx) => ({
        ...sec,
        order: idx + 1,
      })
    );

    setSections(newSections);

    axios
      .post(`${apiUrl}/reorder`, {
        orderedIndexes: newSections.map((_, i) => i),
      })
      .then(() => showToast("Order saved!", "success"))
      .catch(() => showToast("Failed to save order", "error"));
  };

  const addItemToNewSection = () => {
    if (!currentItemInput.trim()) return;
    setNewSectionItems([...newSectionItems, { name: currentItemInput.trim() }]);
    setCurrentItemInput("");
    itemInputRef.current?.focus();
  };

  const removeItemFromNewSection = (index: number) => {
    setNewSectionItems(newSectionItems.filter((_, i) => i !== index));
  };

  const openEditModal = (section: Section & { id: string }) => {
    setEditingSection(section);
    setEditingItems(section.items.map((item) => ({ ...item }))); // Deep copy for reactivity
    setCurrentItemInput("");
  };

  const addItemToEditing = () => {
    if (!currentItemInput.trim()) return;
    setEditingItems([...editingItems, { name: currentItemInput.trim() }]);
    setCurrentItemInput("");
    itemInputRef.current?.focus();
  };

  const removeItemFromEditing = (index: number) => {
    setEditingItems(editingItems.filter((_, i) => i !== index));
  };

  const updateItemName = (index: number, newName: string) => {
    const updated = [...editingItems];
    updated[index].name = newName;
    setEditingItems(updated);
  };

  const handleAdd = async () => {
    if (!newSectionHeading.trim())
      return showToast("Heading required!", "error");
    if (newSectionItems.length === 0)
      return showToast("Add at least one item!", "error");

    try {
      await axios.post(`${apiUrl}/section`, {
        heading: newSectionHeading.trim(),
        items: newSectionItems,
      });

      setNewSectionHeading("");
      setNewSectionItems([]);
      setCurrentItemInput("");
      setIsAdding(false);
      showToast("New section added!", "success");
      fetchData();
    } catch (err) {
      showToast("Failed to add section", "error");
    }
  };

  const handleUpdate = async () => {
    if (!editingSection) return;

    try {
      const index = sections.findIndex((s) => s.id === editingSection.id);

      await axios.put(`${apiUrl}/section/${index}`, {
        heading: editingSection.heading.trim(),
        items: editingItems,
      });

      showToast("Section updated!", "success");
      setEditingSection(null);
      setCurrentItemInput("");
      fetchData();
    } catch (err) {
      showToast("Update failed", "error");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this section permanently?")) return;
    const index = sections.findIndex((s) => s.id === id);
    try {
      await axios.delete(`${apiUrl}/section/${index}`);
      showToast("Section deleted", "info");
      fetchData();
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
    <section className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black text-white py-8 px-4 sm:py-12">
      {/* MAX WIDTH 75rem = 1200px */}
      <div className="max-w-[45rem] mx-auto">
        <div className="text-center mb-10 sm:mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3">
            VST Lists Admin Dashboard
          </h2>
          <p className="text-gray-400 text-base sm:text-lg">
            Manage unlimited sections & VST items
          </p>
        </div>

        <div className="flex justify-center sm:justify-end mb-8">
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-3 bg-yellow-400 hover:bg-yellow-500 text-black font-bold px-6 py-4 rounded-xl shadow-lg transition text-base sm:text-lg touch-manipulation"
          >
            <Plus className="w-6 h-6" /> Add New Section
          </button>
        </div>

        {/* Add New Section */}
        {isAdding && (
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 sm:p-8 mb-12 border-4 border-yellow-400/40 shadow-2xl">
            <h3 className="text-2xl sm:text-3xl font-bold mb-6 text-yellow-300">
              Add New Section
            </h3>

            <input
              type="text"
              placeholder="Section Heading"
              value={newSectionHeading}
              onChange={(e) => setNewSectionHeading(e.target.value)}
              className="w-full bg-gray-700 border-2 border-gray-600 rounded-xl px-5 py-4 mb-8 text-lg sm:text-xl focus:border-yellow-400"
              autoFocus
            />

            <div className="mb-6">
              <div className="flex flex-col sm:flex-row gap-3 mb-5">
                <input
                  ref={itemInputRef}
                  type="text"
                  placeholder="Add VST item (press Enter)"
                  value={currentItemInput}
                  onChange={(e) => setCurrentItemInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && currentItemInput.trim()) {
                      e.preventDefault();
                      addItemToNewSection();
                    }
                  }}
                  className="flex-1 bg-gray-700 border-2 border-gray-600 rounded-xl px-5 py-4 text-base sm:text-lg focus:border-purple-400"
                />
                <button
                  onClick={addItemToNewSection}
                  disabled={!currentItemInput.trim()}
                  className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 px-6 py-4 rounded-xl font-bold flex items-center gap-2 touch-manipulation"
                >
                  <Plus className="w-5 h-5" /> Add
                </button>
              </div>

              <div className="min-h-0 max-h-[416px] overflow-auto px-[10px]">
                {newSectionItems.length === 0 ? (
                  <p className="text-center py-10 text-gray-500 italic">
                    No items yet — start adding!
                  </p>
                ) : (
                  newSectionItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 bg-gray-800/60 rounded-xl px-4 py-4 border border-gray-700 mb-[10px]"
                    >
                      <div className="flex-1 min-w-0">
                        <span className="text-gray-200 break-words">
                          {item.name}
                        </span>
                      </div>
                      <div className="flex-shrink-0">
                        <button
                          onClick={() => removeItemFromNewSection(idx)}
                          className="text-red-500 hover:text-red-400 transition touch-manipulation"
                        >
                          <X className="w-8 h-8" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mt-10">
              <button
                onClick={handleAdd}
                disabled={
                  !newSectionHeading.trim() || newSectionItems.length === 0
                }
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-3 text-base sm:text-lg touch-manipulation"
              >
                <Save className="w-6 h-6" />
                Create ({newSectionItems.length} items)
              </button>
              <button
                onClick={() => {
                  setIsAdding(false);
                  setNewSectionHeading("");
                  setNewSectionItems([]);
                  setCurrentItemInput("");
                }}
                className="bg-gray-700 hover:bg-gray-600 px-8 py-4 rounded-xl font-bold text-base sm:text-lg touch-manipulation"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {editingSection && (
          <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
            <div className="bg-gray-900 rounded-3xl p-6 sm:p-8 w-full max-w-4xl max-h-[95vh] overflow-y-auto border-4 border-yellow-400">
              <h3 className="text-2xl sm:text-3xl font-bold mb-6">
                Edit Section
              </h3>

              <input
                value={editingSection.heading}
                onChange={(e) =>
                  setEditingSection({
                    ...editingSection,
                    heading: e.target.value,
                  })
                }
                className="w-full bg-gray-800 border-2 border-gray-700 rounded-xl px-5 py-4 mb-8 text-xl sm:text-2xl focus:border-yellow-400"
              />

              <div className="mb-6">
                <div className="flex flex-col sm:flex-row gap-3 mb-5">
                  <input
                    ref={itemInputRef}
                    type="text"
                    placeholder="Add or edit item (press Enter to add)"
                    value={currentItemInput}
                    onChange={(e) => setCurrentItemInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && currentItemInput.trim()) {
                        e.preventDefault();
                        addItemToEditing();
                      }
                    }}
                    className="flex-1 bg-gray-800 border-2 border-gray-700 rounded-xl px-5 py-4 text-base sm:text-lg focus:border-purple-400"
                  />
                  <button
                    onClick={addItemToEditing}
                    disabled={!currentItemInput.trim()}
                    className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 px-6 py-4 rounded-xl font-bold flex items-center gap-2 touch-manipulation"
                  >
                    <Plus className="w-5 h-5" /> Add
                  </button>
                </div>

                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {editingItems.length === 0 ? (
                    <p className="text-center py-12 text-gray-500 italic text-lg">
                      No items — add some!
                    </p>
                  ) : (
                    editingItems.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center bg-gray-800/60 rounded-xl px-4 py-4 border border-gray-700 hover:border-purple-500 transition"
                      >
                        <div className="flex-1 min-w-0 pr-3">
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) =>
                              updateItemName(idx, e.target.value)
                            }
                            className="w-full bg-transparent text-gray-200 text-base sm:text-lg focus:outline-none focus:ring-2 focus:ring-purple-500 rounded px-3 py-2 break-words"
                            placeholder="Item name"
                          />
                        </div>
                        <div className="flex-shrink-0">
                          <button
                            onClick={() => removeItemFromEditing(idx)}
                            className="text-red-500 hover:text-red-400 transition touch-manipulation"
                          >
                            <X className="w-8 h-8" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mt-10">
                <button
                  onClick={handleUpdate}
                  className="bg-green-600 hover:bg-green-700 px-8 py-5 rounded-xl font-bold flex items-center justify-center gap-3 text-lg sm:text-xl transition touch-manipulation shadow-lg"
                >
                  <Save className="w-7 h-7" /> Save Changes
                </button>
                <button
                  onClick={() => {
                    setEditingSection(null);
                    setCurrentItemInput("");
                  }}
                  className="bg-gray-700 hover:bg-gray-600 px-8 py-5 rounded-xl font-bold text-lg sm:text-xl transition touch-manipulation"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Sections List */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sections.map((s) => s.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-6">
              {sections.map((section) => (
                <SortableSection
                  key={section.id}
                  section={section}
                  onEdit={openEditModal}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {sections.length === 0 && !isAdding && (
          <div className="text-center py-20 sm:py-32 bg-gray-900/50 rounded-3xl border-4 border-dashed border-gray-700">
            <p className="text-2xl sm:text-3xl text-gray-400 mb-8">
              No VST sections yet
            </p>
            <button
              onClick={() => setIsAdding(true)}
              className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold px-10 py-5 rounded-2xl text-xl sm:text-2xl shadow-2xl touch-manipulation"
            >
              Create Your First Section
            </button>
          </div>
        )}
      </div>

      {/* Toast */}
      {toast.visible && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 w-full max-w-sm">
          <div
            className={`flex items-center gap-4 px-6 py-4 rounded-2xl shadow-2xl text-white font-bold text-base sm:text-xl border-4 animate-bounce-in ${
              toast.type === "success"
                ? "bg-green-600 border-green-400"
                : toast.type === "error"
                ? "bg-red-600 border-red-400"
                : "bg-blue-600 border-blue-400"
            }`}
          >
            {toast.type === "success" && (
              <Check className="w-8 h-8 flex-shrink-0" />
            )}
            {toast.type === "error" && <X className="w-8 h-8 flex-shrink-0" />}
            {toast.type === "info" && (
              <Trash2 className="w-8 h-8 flex-shrink-0" />
            )}
            <span className="break-words">{toast.message}</span>
          </div>
        </div>
      )}
    </section>
  );
};

export default VSTLitsDashboard;
