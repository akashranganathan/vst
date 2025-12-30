// src/components/SupportTicket.tsx
import React, { useState } from "react";
import axios from "axios";

const SupportTicket: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const apiUrl = `${import.meta.env.VITE_API_BASE_URL.replace(
    /\/+$/,
    ""
  )}/api/tickets`;

  const handleSubmit = async () => {
    if (!email.trim()) {
      setError("Email is required");
      return;
    }
    if (!message.trim()) {
      setError("Message is required");
      return;
    }

    setLoading(true);
    setSuccess(false);
    setError("");

    const ticketData = {
      name: name.trim() || "Customer",
      email: email.trim().toLowerCase(),
      subject: subject.trim() || "Support Request",
      message: message.trim(),
    };

    try {
      await axios.post(apiUrl, ticketData);

      setSuccess(true);
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    } catch (err: any) {
      console.error("Ticket submission failed:", err);
      const msg =
        err.response?.data?.error ||
        err.message ||
        "Failed to submit ticket. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-black via-gray-900 to-black">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
            Need <span className="text-yellow-400">Help</span>? We're Here
          </h2>
          <div className="w-16 sm:w-24 h-1 bg-gradient-to-r from-yellow-400 to-orange-500 mx-auto rounded-full" />
        </div>

        {/* Success Message */}
        {success && (
          <div className="max-w-2xl mx-auto mb-12 bg-green-900/60 border border-green-500 text-green-100 p-8 rounded-2xl text-center shadow-2xl">
            <h3 className="text-3xl font-bold mb-4">✅ Ticket Submitted!</h3>
            <p className="text-xl">
              Thank you! We've received your message and sent a confirmation to{" "}
              <strong>{email}</strong>.
            </p>
            <p className="mt-4 text-lg">
              We'll get back to you within <strong>24-48 hours</strong>.
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="max-w-2xl mx-auto mb-12 bg-red-900/60 border border-red-500 text-red-100 p-6 rounded-2xl text-center shadow-2xl">
            <p className="text-xl">⚠️ {error}</p>
          </div>
        )}

        {/* Ticket Form */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 lg:p-8 shadow-2xl">
            <h3 className="text-2xl font-bold text-white mb-6 text-center">
              Raise a Support Ticket
            </h3>
            <div className="space-y-6">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your Name (optional)"
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 text-base"
              />

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your Email *"
                required
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 text-base"
              />

              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Subject (optional)"
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 text-base"
              />

              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your issue in detail *"
                rows={6}
                required
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 resize-none text-base"
              />

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold rounded-lg hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-yellow-400/25 disabled:opacity-70"
              >
                <span>{loading ? "Submitting..." : "Submit Ticket"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* WhatsApp CTA */}
        <div className="text-center mt-16">
          <p className="text-gray-400 text-lg mb-6">
            Need help{" "}
            <span className="text-green-400 font-bold">right now</span>?
          </p>
          <a
            href="https://wa.me/919876543210"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-4 bg-green-600 hover:bg-green-700 px-10 py-5 rounded-full text-xl font-bold transition shadow-2xl"
          >
            📱 Chat on WhatsApp (Fastest Response)
          </a>
        </div>
      </div>
    </section>
  );
};

export default SupportTicket;
