"use client";
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

type Buyer = {
  id: string;
  fullName: string;
  phone: string;
  city: string;
  propertyType: string;
  budgetMin: number | null;
  budgetMax: number | null;
  timeline: string;
  status: string;
  updatedAt: string;
};

function BuyersPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  const [cities, setCities] = useState<string[]>([]);
  const [propertyTypes, setPropertyTypes] = useState<string[]>([]);
  const [statuses, setStatuses] = useState<string[]>([]);

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [city, setCity] = useState(searchParams.get("city") || "");
  const [propertyType, setPropertyType] = useState(
    searchParams.get("propertyType") || ""
  );
  const [status, setStatus] = useState(searchParams.get("status") || "");
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);
  const limit = 10;

  const [debouncedSearch, setDebouncedSearch] = useState(search);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    async function fetchDropdowns() {
      try {
        const [cRes, pRes, sRes] = await Promise.all([
          fetch("/api/buyers/cities"),
          fetch("/api/buyers/property-types"),
          fetch("/api/buyers/statuses"),
        ]);
        if (!cRes.ok || !pRes.ok || !sRes.ok) throw new Error("Failed to fetch dropdown values");

        const [cData, pData, sData] = await Promise.all([
          cRes.json(),
          pRes.json(),
          sRes.json(),
        ]);

        if (cData.success) setCities(cData.cities);
        if (pData.success) setPropertyTypes(pData.propertyTypes);
        if (sData.success) setStatuses(sData.statuses);
      } catch (err) {
        console.error("Error fetching dropdowns:", err);
      }
    }
    fetchDropdowns();
  }, []);

  useEffect(() => {
    async function fetchBuyers() {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
        });
        if (debouncedSearch) params.set("search", debouncedSearch);
        if (city) params.set("city", city);
        if (propertyType) params.set("propertyType", propertyType);
        if (status) params.set("status", status);

        const res = await fetch(`/api/buyers?${params.toString()}`);
        if (!res.ok) throw new Error("Failed to fetch buyers");
        const data = await res.json();

        setBuyers(data.buyers || []);
        setTotal(data.pagination?.total || 0);
      } catch (err) {
        console.error("Error fetching buyers:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchBuyers();

    const newParams = new URLSearchParams();
    if (debouncedSearch) newParams.set("search", debouncedSearch);
    if (city) newParams.set("city", city);
    if (propertyType) newParams.set("propertyType", propertyType);
    if (status) newParams.set("status", status);
    newParams.set("page", page.toString());

    router.replace(`/buyers?${newParams.toString()}`);
  }, [debouncedSearch, city, propertyType, status, page, router]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Buyers</h1>
        <Link
          href="/buyers/new"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + New Buyer
        </Link>
      </div>

      {/* Search & Filters */}
      <div className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-4">
        <input
          type="text"
          placeholder="Search by name, phone, email..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="border p-2 w-full rounded"
        />

        <select
          value={city}
          onChange={(e) => {
            setCity(e.target.value);
            setPage(1);
          }}
          className="border p-2 rounded bg-white text-gray-800 dark:bg-gray-800 dark:text-white"
        >
          <option value="">All Cities</option>
          {cities.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <select
          value={propertyType}
          onChange={(e) => {
            setPropertyType(e.target.value);
            setPage(1);
          }}
          className="border p-2 rounded bg-white text-gray-800 dark:bg-gray-800 dark:text-white"
        >
          <option value="">All Property Types</option>
          {propertyTypes.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>

        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="border p-2 rounded bg-white text-gray-800 dark:bg-gray-800 dark:text-white"
        >
          <option value="">All Status</option>
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p>Loading buyers...</p>
      ) : buyers.length === 0 ? (
        <p className="text-gray-500">No buyers found.</p>
      ) : (
        <>
          <table className="w-full border-collapse border">
            <thead>
              <tr className="bg-gray-200 text-gray-800">
                <th className="border px-4 py-2 text-left">Name</th>
                <th className="border px-4 py-2 text-left">Phone</th>
                <th className="border px-4 py-2 text-left">City</th>
                <th className="border px-4 py-2 text-left">Property</th>
                <th className="border px-4 py-2 text-left">Budget</th>
                <th className="border px-4 py-2 text-left">Timeline</th>
                <th className="border px-4 py-2 text-left">Status</th>
                <th className="border px-4 py-2 text-left">Updated</th>
              </tr>
            </thead>
            <tbody>
              {buyers.map((b) => (
                <tr key={b.id}>
                  <td className="border px-4 py-2">
                    <Link
                      href={`/buyers/${b.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      {b.fullName}
                    </Link>
                  </td>
                  <td className="border px-4 py-2">{b.phone}</td>
                  <td className="border px-4 py-2">{b.city}</td>
                  <td className="border px-4 py-2">{b.propertyType}</td>
                  <td className="border px-4 py-2">
                    {b.budgetMin ?? "-"} - {b.budgetMax ?? "-"}
                  </td>
                  <td className="border px-4 py-2">{b.timeline}</td>
                  <td className="border px-4 py-2">{b.status}</td>
                  <td className="border px-4 py-2">
                    {new Date(b.updatedAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-between items-center mt-4">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-4 py-2 border rounded disabled:opacity-50"
            >
              Prev
            </button>
            <span>
              Page {page} of {totalPages || 1}
            </span>
            <button
              disabled={page === totalPages || totalPages === 0}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="px-4 py-2 border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default function BuyersPage() {
  return (
    <Suspense fallback={<p>Loading buyers page...</p>}>
      <BuyersPageContent />
    </Suspense>
  );
}
