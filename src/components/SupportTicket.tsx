// src/components/SupportTicket.tsx
import React, { useState } from "react";
import emailjs from "@emailjs/browser";

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

    if (!email.trim() || !message.trim()) {
      setError("Email and message are required");
      return;
    }

    setLoading(true);
    setSuccess(false);
    setError("");

    try {
      // 1. Save ticket to backend
      const saveRes = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim() || "Customer",
          email: email.trim().toLowerCase(),
          subject: subject.trim() || "Support Request",
          message: message.trim(),
        }),
      });

      if (!saveRes.ok) throw new Error("Failed to save ticket");

      // 2. Send email to ADMIN only
      await emailjs.send(
        "service_qnqab1c", // your service ID
        "template_bodqujy", // ← NEW template ID for admin alert
        {
          name: name.trim() || "Customer",
          email: email.trim().toLowerCase(),
          subject: subject.trim() || "Support Request",
          message: message.trim(),
        },
        "7T1_Ty4C7WFeI74xF" // your public key
      );

      // Success — show message on screen
      setSuccess(true);
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    } catch (err: any) {
      console.error(err);
      setError("Failed to send query. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-16 bg-gradient-to-br from-black via-gray-900 to-black">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-5xl font-bold text-white mb-4">
            Contact <span className="text-yellow-400">Support</span>
          </h2>
        </div>

        {success && (
          <div className="max-w-2xl mx-auto mb-12 bg-green-900/60 border border-green-500 p-8 rounded-2xl text-center">
            <h3 className="text-3xl font-bold text-green-300 mb-4">
              Query Sent Successfully!
            </h3>
            <p className="text-xl">
              We'll get back to you soon via email or WhatsApp.
            </p>
          </div>
        )}

        {error && (
          <div className="max-w-2xl mx-auto mb-12 bg-red-900/60 border border-red-500 p-6 rounded-2xl text-center">
            <p className="text-xl text-red-300">{error}</p>
          </div>
        )}

        <div className="max-w-2xl mx-auto">
          <form
            onSubmit={handleSubmit}
            className="bg-gray-800/80 p-10 rounded-3xl shadow-2xl"
          >
            <input
              type="text"
              placeholder="Your Name (optional)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full mb-6 px-6 py-4 bg-gray-900 border border-gray-700 rounded-xl text-white"
            />
            <input
              type="email"
              placeholder="Your Email *"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full mb-6 px-6 py-4 bg-gray-900 border border-gray-700 rounded-xl text-white"
            />
            <input
              type="text"
              placeholder="Subject (optional)"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full mb-6 px-6 py-4 bg-gray-900 border border-gray-700 rounded-xl text-white"
            />
            <textarea
              placeholder="Your Message *"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              rows={8}
              className="w-full mb-8 px-6 py-4 bg-gray-900 border border-gray-700 rounded-xl text-white resize-none"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold text-xl rounded-xl hover:scale-105 transition"
            >
              {loading ? "Sending..." : "Send Query"}
            </button>
          </form>
        </div>

        <div className="text-center mt-12">
          <a
            href="https://wa.me/919876543210"
            className="inline-block bg-green-600 hover:bg-green-700 px-10 py-5 rounded-full text-xl font-bold"
          >
            📱 Chat on WhatsApp (Faster)
          </a>
        </div>
      </div>
    </section>
  );
};

export default SupportTicket;
