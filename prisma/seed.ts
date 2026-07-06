import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const VENDORS = [
  { name: "Afterpay" },
  { name: "Klarna" },
  { name: "Affirm" },
  { name: "Zip" },
  { name: "PayPal Pay in 4" },
  { name: "Sezzle" },
  { name: "Quadpay" },
  { name: "Laybuy" },
  { name: "Openpay" },
  { name: "Hummm" },
];

async function main() {
  for (const vendor of VENDORS) {
    await prisma.vendor.upsert({
      where: { name: vendor.name },
      update: {},
      create: vendor,
    });
  }
  console.log(`Seeded ${VENDORS.length} BNPL vendors.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
