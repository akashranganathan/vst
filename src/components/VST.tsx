// src/components/VST.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Loader2, ChevronRight } from "lucide-react";

interface Item {
  name: string;
  isActive?: boolean;
}

interface Section {
  _id: string;
  heading: string;
  order: number;
  items: Item[];
}

const VST: React.FC = () => {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string | null>(null);

  const apiUrl = `${import.meta.env.VITE_API_BASE_URL?.replace(
    /\/+$/,
    ""
  )}/api/lists`;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await axios.get(apiUrl);
        const sortedSections = (res.data.sections as Section[]).sort(
          (a: Section, b: Section) => a.order - b.order
        );
        setSections(sortedSections);
        if (sortedSections.length > 0) {
          setActiveTab(sortedSections[0]._id);
        }
      } catch (err) {
        console.error("Failed to load VST lists:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const currentSection = sections.find((s) => s._id === activeTab);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-20 h-20 text-yellow-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero */}
      <header
        className="relative py-8 px-6 overflow-hidden
"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-yellow-900/20 via-black to-black" />
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 via-orange-500/10 to-transparent blur-3xl" />
        <div className="relative max-w-6xl mx-auto text-center">
          <h1 className="text-[35px] md:text-8xl lg:text-9xl font-black tracking-tighter mb-8">
            <span className="bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-500 bg-clip-text text-transparent">
              Explore Top VST Plugins
            </span>
          </h1>
          {/* <p className="text-2xl md:text-3xl text-gray-400 max-w-4xl mx-auto leading-relaxed">
            Next-level curated collections of groundbreaking plugins — 2025
          </p> */}
        </div>
      </header>

      {/* Tabs */}
      <div className="border-b border-gray-800/50 py-4 px-6 sticky top-0 bg-black/80 backdrop-blur-md z-10">
        <div className="flex flex-wrap gap-3 justify-center items-center">
          {sections.map((section) => (
            <button
              key={section._id}
              onClick={() => setActiveTab(section._id)}
              className={`relative px-5 py-2.5 rounded-full font-medium text-sm flex items-center gap-2 transition-all duration-300 hover:scale-105 ${
                activeTab === section._id
                  ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-black shadow-md shadow-yellow-500/40"
                  : "bg-gray-800/60 text-gray-300 hover:text-white hover:bg-gray-800/80"
              }`}
            >
              <span>{section.heading.toUpperCase()}</span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  activeTab === section._id
                    ? "bg-black/60 text-yellow-300"
                    : "bg-gray-700/60 text-gray-400"
                }`}
              >
                {section.items.length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Two-Column List Content */}
      <main className="py-12 px-6 md:py-20">
        <div className="max-w-6xl mx-auto">
          {currentSection && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-6">
              {currentSection.items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start space-x-3 p-3 bg-gray-800/50 rounded-lg hover:bg-gray-700/50 transition duration-300"
                >
                  <ChevronRight className="w-5 h-5 text-yellow-400 mt-1 animate-pulse" />
                  <p className="text-base text-gray-300"> {item.name}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default VST;
