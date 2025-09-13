# Buyer Leads Intake App

A mini CRM-like app to capture, list, and manage buyer leads with validation, history tracking, notes, and CSV import/export.  
Built with **Next.js (App Router) + TypeScript + Prisma + Zod**.  

Deployed optionally via **Vercel** and works locally with **SQLite** (can be swapped to Postgres/Supabase).

---

## ✨ Features

- ✅ Create buyer leads with full validation (**Zod** on client + server)  
- ✅ List buyers with **search, filters, pagination (10 per page)**  
- ✅ View + edit buyer details with **concurrency control** (`updatedAt` check)  
- ✅ Track changes in buyer **history** (field diffs logged automatically)  
- ✅ Add **notes** per buyer (separate notes table)  
- ✅ **CSV import** (max 200 rows) with row-level validation + error report  
- ✅ **CSV export** (respects filters/search/sort)  
- ✅ **Auth-ready**: `ownerId` assigned, edit/delete only by owner (or admin if extended)  
- ✅ Unit test for **note validator** (`BuyerNoteSchema`)  
- ✅ Clean referential integrity: deleting a buyer also deletes history + notes  
- ✅ Rate limiting: 5 requests/minute per IP on create & delete endpoints (via Upstash Ratelimit)
- ✅ Error boundaries & empty state pages  


---
---

## 🛡 Quality Bar

- Strong input validation on client + server (Zod)  
- Referential integrity enforced with Prisma relations  
- Rate limiting: 5 requests/minute per IP on create & delete endpoints (via Upstash Ratelimit)  

## 🛠 Tech Stack

- **Next.js 14+ (App Router)**  
- **TypeScript**  
- **Prisma ORM** (default SQLite, can switch to Postgres/Supabase)  
- **Zod** (validation)  
- **Jest** (unit testing)  
- **TailwindCSS** (styling)  

---

## 📦 Data Model

### Buyer

| Field        | Type      | Notes                                                                 |
|--------------|-----------|-----------------------------------------------------------------------|
| id           | UUID      | Primary key                                                           |
| fullName     | string    | 2–80 chars                                                            |
| email        | string    | Optional, must be valid email                                         |
| phone        | string    | 10–15 digits, required                                                |
| city         | enum      | `Chandigarh`, `Mohali`, `Zirakpur`, `Panchkula`, `Other`              |
| propertyType | enum      | `Apartment`, `Villa`, `Plot`, `Office`, `Retail`                      |
| bhk          | enum      | `Studio`, `1–4` (required only if Apartment/Villa)                     |
| purpose      | enum      | `Buy`, `Rent`                                                         |
| budgetMin    | int       | Optional                                                              |
| budgetMax    | int       | Optional, must be ≥ budgetMin                                          |
| timeline     | enum      | `0-3m`, `3-6m`, `>6m`, `Exploring`                                    |
| source       | enum      | `Website`, `Referral`, `Walk-in`, `Call`, `Other`                     |
| status       | enum      | `New` (default), `Qualified`, `Contacted`, `Visited`, `Negotiation`, `Converted`, `Dropped` |
| notes        | string    | Optional, ≤ 1000 chars                                                |
| tags         | string[]  | Optional (comma-separated)                                            |
| ownerId      | string    | Set to current user                                                   |
| updatedAt    | DateTime  | Auto-updated on change                                                |

### BuyerHistory

Tracks field diffs when a record is updated.  

| Field      | Type     | Notes                                   |
|------------|----------|-----------------------------------------|
| id         | UUID     | Primary key                             |
| buyerId    | UUID     | FK → Buyer                              |
| changedBy  | string   | User who made the change                |
| changedAt  | DateTime | Timestamp                               |
| diff       | JSON     | Changed fields (old → new)              |

### BuyerNote

Stores freeform notes per buyer.  

| Field      | Type     | Notes                                   |
|------------|----------|-----------------------------------------|
| id         | UUID     | Primary key                             |
| buyerId    | UUID     | FK → Buyer                              |
| content    | string   | Note content                            |
| createdBy  | string   | User who added the note (default system)|
| createdAt  | DateTime | Timestamp                               |

---

## 🚀 Getting Started

### 1. Clone repo & install dependencies
```bash
git clone https://github.com/lakshmigavirni/Buyer-leads-intake-app.git
cd buyer-leads-intake-app
npm install
