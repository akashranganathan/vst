// src/components/FloatingSupportButton.tsx
import React, { useState, useEffect } from "react";
import SupportTicket from "./SupportTicket";

const FloatingSupportButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAtExactBottom, setIsAtExactBottom] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      // Pixels remaining to scroll until absolute bottom
      const pixelsFromBottom = documentHeight - (scrollTop + windowHeight);

      // Hide only when very close to the absolute bottom
      // (even 10px scroll up → visible again)
      const hideThreshold = 10; // pixels

      setIsAtExactBottom(pixelsFromBottom <= hideThreshold);
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleScroll);
    handleScroll(); // initial check

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  return (
    <>
      {/* Floating icon – visible everywhere EXCEPT exactly at the bottom */}
      <button
        onClick={() => setIsOpen(true)}
        className={`
          fixed z-50
          right-4 sm:right-6
          bottom-8 sm:bottom-6             /* higher on mobile */
          w-11 h-11 sm:w-12 sm:h-12 lg:w-14 lg:h-14   /* smaller on mobile */
          rounded-full                      /* perfect circle */
          aspect-square                     /* force square shape */
          bg-gradient-to-br from-yellow-600 to-orange-700
          text-black
          shadow-md shadow-orange-600/20 hover:shadow-orange-500/40
          hover:scale-105 active:scale-95
          transition-all duration-300
          flex items-center justify-center
          border border-orange-500/20
          ${
            isAtExactBottom
              ? "opacity-0 pointer-events-none scale-90" // hidden at exact bottom
              : "opacity-95 pointer-events-auto"
          }          // visible when scrolling up or anywhere else
        `}
        aria-label="Open music / technical support"
      >
        <span className="text-lg sm:text-xl lg:text-2xl drop-shadow">🎧</span>
      </button>

      {/* Support modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md p-4"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="relative bg-gradient-to-b from-gray-950 to-black rounded-2xl shadow-2xl 
                       w-full max-w-md max-h-[88vh] overflow-y-auto 
                       border border-gray-800/50"
            onClick={(e) => e.stopPropagation()}
          >
            <SupportTicket onClose={() => setIsOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingSupportButton;
