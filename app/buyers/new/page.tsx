"use client";

import { useState } from "react";

export default function NewBuyerPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    city: "Chandigarh",
    propertyType: "Apartment",
    bhk: "TWO", // default enum value
    purpose: "Buy",
    budgetMin: "",
    budgetMax: "",
    timeline: "M0_3", // default enum value
    source: "Website",
    notes: "",
    tags: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/buyers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          budgetMin: Number(formData.budgetMin) || null,
          budgetMax: Number(formData.budgetMax) || null,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("✅ Buyer created successfully!");
      } else {
        setMessage("❌ Error: " + JSON.stringify(data.error));
      }
    } catch (err: any) {
      setMessage("❌ Request failed: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Create Buyer</h1>
      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Full Name */}
        <div>
          <label className="block font-medium">Full Name</label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            required
            className="border p-2 w-full rounded"
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block font-medium">Phone</label>
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
            className="border p-2 w-full rounded"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block font-medium">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="border p-2 w-full rounded"
          />
        </div>

        {/* City */}
        <div>
          <label className="block font-medium">City</label>
          <select
            name="city"
            value={formData.city}
            onChange={handleChange}
            className="border p-2 w-full rounded"
          >
            <option className="bg-white text-black">Chandigarh</option>
            <option className="bg-white text-black">Mohali</option>
            <option className="bg-white text-black">Zirakpur</option>
            <option className="bg-white text-black">Panchkula</option>
            <option className="bg-white text-black">Other</option>
          </select>
        </div>

        {/* Property Type */}
        <div>
          <label className="block font-medium">Property Type</label>
          <select
            name="propertyType"
            value={formData.propertyType}
            onChange={handleChange}
            className="border p-2 w-full rounded"
          >
            <option className="bg-white text-black">Apartment</option>
            <option className="bg-white text-black">Villa</option>
            <option className="bg-white text-black">Plot</option>
            <option className="bg-white text-black">Office</option>
            <option className="bg-white text-black">Retail</option>
          </select>
        </div>

        {/* BHK */}
        {(formData.propertyType === "Apartment" || formData.propertyType === "Villa") && (
          <div>
            <label className="block font-medium">BHK</label>
            <select
              name="bhk"
              value={formData.bhk}
              onChange={handleChange}
              className="border p-2 w-full rounded"
            >
              <option value="STUDIO" className="bg-white text-black">Studio</option>
              <option value="ONE" className="bg-white text-black">1</option>
              <option value="TWO" className="bg-white text-black">2</option>
              <option value="THREE" className="bg-white text-black">3</option>
              <option value="FOUR" className="bg-white text-black">4</option>
            </select>
          </div>
        )}

        {/* Purpose */}
        <div>
          <label className="block font-medium">Purpose</label>
          <select
            name="purpose"
            value={formData.purpose}
            onChange={handleChange}
            className="border p-2 w-full rounded"
          >
            <option className="bg-white text-black">Buy</option>
            <option className="bg-white text-black">Rent</option>
          </select>
        </div>

        {/* Budget */}
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block font-medium">Budget Min</label>
            <input
              type="number"
              name="budgetMin"
              value={formData.budgetMin}
              onChange={handleChange}
              className="border p-2 w-full rounded"
            />
          </div>
          <div className="flex-1">
            <label className="block font-medium">Budget Max</label>
            <input
              type="number"
              name="budgetMax"
              value={formData.budgetMax}
              onChange={handleChange}
              className="border p-2 w-full rounded"
            />
          </div>
        </div>

        {/* Timeline */}
        <div>
          <label className="block font-medium">Timeline</label>
          <select
            name="timeline"
            value={formData.timeline}
            onChange={handleChange}
            className="border p-2 w-full rounded"
          >
            <option value="M0_3" className="bg-white text-black">0-3m</option>
            <option value="M3_6" className="bg-white text-black">3-6m</option>
            <option value="M6_PLUS" className="bg-white text-black">More than 6m</option>
            <option value="EXPLORING" className="bg-white text-black">Exploring</option>
          </select>
        </div>

        {/* Source */}
        <div>
          <label className="block font-medium">Source</label>
          <select
            name="source"
            value={formData.source}
            onChange={handleChange}
            className="border p-2 w-full rounded"
          >
            <option className="bg-white text-black">Website</option>
            <option className="bg-white text-black">Referral</option>
            <option className="bg-white text-black">Walk-in</option>
            <option className="bg-white text-black">Call</option>
            <option className="bg-white text-black">Other</option>
          </select>
        </div>

        {/* Notes */}
        <div>
          <label className="block font-medium">Notes</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            className="border p-2 w-full rounded"
            rows={3}
          />
        </div>

        {/* Tags */}
        <div>
          <label className="block font-medium">Tags (comma separated)</label>
          <input
            type="text"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            className="border p-2 w-full rounded"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {loading ? "Saving..." : "Create Buyer"}
        </button>
      </form>

      {message && <p className="mt-4">{message}</p>}
    </div>
  );
}
