// src/components/SupportTicket.tsx
import React, { useState } from "react";

const SupportTicket: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError("");

    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim() || "Customer",
          email: email.trim().toLowerCase(),
          subject: subject.trim() || "Support Request",
          message: message.trim(),
        }),
      });

      // Check if response is ok
      if (!res.ok) {
        // Try to get error message from server
        let errorMsg = "Failed to submit ticket";
        try {
          const errorData = await res.json();
          errorMsg = errorData.error || errorMsg;
        } catch {
          // If no JSON, use status text
          errorMsg = res.statusText || errorMsg;
        }
        throw new Error(errorMsg);
      }

      // Only try to parse JSON if there's content
      let data;
      const text = await res.text();
      if (text) {
        data = JSON.parse(text);
      }

      setSuccess(true);
      alert("Ticket submitted successfully! Check your email now.");
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    } catch (err: any) {
      setError(err.message || "Network error. Check console.");
      console.error("Ticket submit error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Need Help? We're Here 🎧
          </h1>
          <p className="text-xl text-gray-400">
            Raise a ticket and we'll get back to you fast
          </p>
        </div>

        {success && (
          <div className="bg-green-900/50 border border-green-600 text-green-200 p-8 rounded-2xl mb-8 text-center">
            <h2 className="text-3xl font-bold mb-4">✅ Ticket Submitted!</h2>
            <p className="text-lg">
              Thank you! We've received your request and sent a confirmation to{" "}
              <strong>{email}</strong>.
            </p>
            <p className="mt-4">We'll reply within 24-48 hours.</p>
          </div>
        )}

        {error && (
          <div className="bg-red-900/50 border border-red-600 text-red-200 p-6 rounded-2xl mb-8 text-center">
            <p className="text-lg">⚠️ {error}</p>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 md:p-12 rounded-3xl shadow-2xl border border-gray-700"
        >
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <input
              type="text"
              placeholder="Your Name (optional)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-6 py-4 bg-gray-800 border border-gray-700 rounded-xl text-lg focus:outline-none focus:border-yellow-400 transition"
            />

            <input
              type="email"
              placeholder="Your Email *"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-6 py-4 bg-gray-800 border border-gray-700 rounded-xl text-lg focus:outline-none focus:border-yellow-400 transition"
            />
          </div>

          <input
            type="text"
            placeholder="Subject (optional)"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full px-6 py-4 mb-6 bg-gray-800 border border-gray-700 rounded-xl text-lg focus:outline-none focus:border-yellow-400 transition"
          />

          <textarea
            placeholder="Describe your issue in detail * (e.g., plugin not working, installation help, etc.)"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            rows={8}
            className="w-full px-6 py-4 mb-8 bg-gray-800 border border-gray-700 rounded-xl text-lg focus:outline-none focus:border-yellow-400 transition resize-none"
          />

          <button
            type="submit"
            disabled={loading || !email || !message}
            className="w-full py-5 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold text-xl rounded-xl hover:scale-105 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg"
          >
            {loading ? "Submitting..." : "Submit Ticket"}
          </button>
        </form>

        <div className="text-center mt-12">
          <p className="text-gray-400 mb-4">Need help right now?</p>
          <a
            href="https://wa.me/919876543210"
            className="inline-flex items-center gap-3 bg-green-600 hover:bg-green-700 px-8 py-4 rounded-full text-lg font-semibold transition"
          >
            📱 Chat on WhatsApp (Fastest Response)
          </a>
        </div>
      </div>
    </div>
  );
};

export default SupportTicket;
