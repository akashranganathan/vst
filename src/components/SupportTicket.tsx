// src/components/SupportTicket.tsx
import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import emailjs from "@emailjs/browser";

interface SupportTicketProps {
  onClose: () => void;
}

const SupportTicket: React.FC<SupportTicketProps> = ({ onClose }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const formRef = useRef<HTMLFormElement>(null);

  const apiUrl = `${import.meta.env.VITE_API_BASE_URL?.replace(
    /\/+$/,
    "",
  )}/api/tickets`;

  // Submit enabled only when name, email and message are filled
  const isFormValid =
    name.trim() !== "" && email.trim() !== "" && message.trim() !== "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setSuccess(false);
    setError("");

    try {
      // Save to backend
      await axios.post(apiUrl, {
        name: name.trim() || "Customer",
        email: email.trim().toLowerCase(),
        subject: subject.trim() || "Support Request",
        message: message.trim(),
      });

      // Send via EmailJS
      if (formRef.current) {
        await emailjs.sendForm(
          "service_qnqab1c",
          "template_jqfvv59",
          formRef.current,
          "7T1_Ty4C7WFeI74xF",
        );
      }

      setSuccess(true);
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    } catch (err: any) {
      console.error("Submission failed:", err);
      const msg =
        err?.response?.data?.error ||
        err?.text ||
        err?.message ||
        "Failed to send ticket. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Auto-close popup 2 seconds after success
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;

    if (success) {
      timer = setTimeout(() => {
        onClose();
      }, 4000); // 5 seconds delay
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [success, onClose]);

  return (
    <div className="relative p-6 sm:p-8 md:p-10 bg-gradient-to-b from-gray-950 to-black rounded-2xl max-w-lg mx-auto border border-gray-800/50 shadow-2xl">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-gray-400 hover:text-white text-3xl font-light transition-colors"
        aria-label="Close"
      >
        ×
      </button>

      {/* Icon + Title */}
      <div className="flex flex-col items-center mb-6">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white text-center">
          Technical Support
        </h2>
        <p className="text-gray-400 text-sm sm:text-base mt-1 text-center">
          For any music related technical assistance please submit a support
          ticket below
        </p>
      </div>

      {/* Success message */}
      {success && (
        <div className="mb-8 p-6 bg-green-950/60 border border-green-700/50 rounded-xl text-center">
          <h3 className="text-xl font-semibold text-green-400 mb-2">
            Your ticket has been submitted successfully!
          </h3>
          <p className="text-green-300/90 text-sm sm:text-base">
            Our support team will get back to you shortly.
          </p>
          {/* <p className="text-gray-500 text-xs mt-3">Closing in 2 seconds...</p> */}
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="mb-6 p-5 bg-red-950/60 border border-red-700/50 rounded-xl text-center">
          <p className="text-red-300 text-sm sm:text-base">{error}</p>
        </div>
      )}

      {/* Form */}
      {!success && (
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
          <input
            type="text"
            name="name"
            placeholder="Your Name *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3.5 bg-gray-900/80 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 transition-all"
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Your Email *"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3.5 bg-gray-900/80 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 transition-all"
            required
          />

          <input
            type="text"
            name="subject"
            placeholder="Subject (optional)"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full px-4 py-3.5 hidden bg-gray-900/80 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 transition-all"
          />

          <textarea
            name="message"
            placeholder="Describe your issue *"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={6}
            className="w-full px-4 py-3.5 bg-gray-900/80 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 transition-all resize-none"
            required
          />

          <button
            type="submit"
            disabled={loading || !isFormValid}
            className={`
              w-full py-4 mt-2 rounded-xl font-bold text-lg transition-all duration-300
              ${
                isFormValid && !loading
                  ? "bg-gradient-to-r from-yellow-500 to-orange-600 text-black hover:from-yellow-400 hover:to-orange-500 hover:shadow-lg hover:shadow-orange-500/40 cursor-pointer"
                  : "bg-gray-700/60 text-gray-400 cursor-not-allowed opacity-70"
              }
              ${loading ? "opacity-60 cursor-wait" : ""}
            `}
          >
            {loading ? "Sending..." : "Submit Ticket"}
          </button>
        </form>
      )}
    </div>
  );
};

export default SupportTicket;
