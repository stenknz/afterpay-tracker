-- CreateTable
CREATE TABLE "PartnerLink" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sharerId" TEXT NOT NULL,
    "viewerId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PartnerLink_sharerId_fkey" FOREIGN KEY ("sharerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PartnerLink_viewerId_fkey" FOREIGN KEY ("viewerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PaymentPlan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "storeId" TEXT,
    "totalAmount" REAL NOT NULL,
    "installmentAmount" REAL NOT NULL,
    "frequency" TEXT NOT NULL DEFAULT 'MONTHLY',
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "visibility" TEXT NOT NULL DEFAULT 'PRIVATE',
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PaymentPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PaymentPlan_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_PaymentPlan" ("createdAt", "endDate", "frequency", "id", "installmentAmount", "notes", "startDate", "status", "storeId", "totalAmount", "updatedAt", "userId") SELECT "createdAt", "endDate", "frequency", "id", "installmentAmount", "notes", "startDate", "status", "storeId", "totalAmount", "updatedAt", "userId" FROM "PaymentPlan";
DROP TABLE "PaymentPlan";
ALTER TABLE "new_PaymentPlan" RENAME TO "PaymentPlan";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "PartnerLink_sharerId_viewerId_key" ON "PartnerLink"("sharerId", "viewerId");
