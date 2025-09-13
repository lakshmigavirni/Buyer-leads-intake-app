// prisma/seed.ts
import prisma from "../lib/prisma";

async function main() {
  await prisma.buyer.create({
    data: {
      fullName: "John Doe",
      phone: "9876543210",
      city: "Chandigarh",
      propertyType: "Apartment",
      bhk: "TWO",
      purpose: "Buy",
      budgetMin: 3000000,
      budgetMax: 5000000,
      timeline: "M0_3",
      source: "Website",
      status: "New",
      ownerId: "demo-user-1",
      notes: "First test lead",
      tags: "hot,priority",
    },
  });

  console.log("✅ Seed data inserted!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
