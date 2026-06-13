-- CreateTable
CREATE TABLE "Vendor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "logoPath" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "AppSetting" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "logoPath" TEXT
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PaymentPlan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "storeId" TEXT,
    "vendorId" TEXT,
    "totalAmount" REAL NOT NULL,
    "installmentAmount" REAL NOT NULL,
    "frequency" TEXT NOT NULL DEFAULT 'MONTHLY',
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "visibility" TEXT NOT NULL DEFAULT 'PRIVATE',
    "title" TEXT,
    "notes" TEXT,
    "archivedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PaymentPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PaymentPlan_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "PaymentPlan_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_PaymentPlan" ("archivedAt", "createdAt", "endDate", "frequency", "id", "installmentAmount", "notes", "startDate", "status", "storeId", "title", "totalAmount", "updatedAt", "userId", "visibility") SELECT "archivedAt", "createdAt", "endDate", "frequency", "id", "installmentAmount", "notes", "startDate", "status", "storeId", "title", "totalAmount", "updatedAt", "userId", "visibility" FROM "PaymentPlan";
DROP TABLE "PaymentPlan";
ALTER TABLE "new_PaymentPlan" RENAME TO "PaymentPlan";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Vendor_name_key" ON "Vendor"("name");

-- Seed vendors
INSERT INTO "Vendor" ("id", "name", "createdAt", "updatedAt") VALUES ('cm8ne4fup000008lbeg9z10q0', 'Afterpay', datetime('now'), datetime('now'));
INSERT INTO "Vendor" ("id", "name", "createdAt", "updatedAt") VALUES ('cm8ne4fup000108lbdhb9z1a0', 'ZIP', datetime('now'), datetime('now'));
INSERT INTO "Vendor" ("id", "name", "createdAt", "updatedAt") VALUES ('cm8ne4fup000208lbg4jz20b0', 'Klarna', datetime('now'), datetime('now'));

-- Seed AppSetting
INSERT INTO "AppSetting" ("id", "logoPath") VALUES ('site', NULL);
