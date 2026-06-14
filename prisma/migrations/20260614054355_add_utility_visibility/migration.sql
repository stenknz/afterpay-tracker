-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Utility" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "amountDue" REAL NOT NULL,
    "dueDate" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'UNPAID',
    "visibility" TEXT NOT NULL DEFAULT 'PRIVATE',
    "logoPath" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Utility_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Utility" ("amountDue", "createdAt", "dueDate", "id", "logoPath", "name", "notes", "status", "updatedAt", "userId") SELECT "amountDue", "createdAt", "dueDate", "id", "logoPath", "name", "notes", "status", "updatedAt", "userId" FROM "Utility";
DROP TABLE "Utility";
ALTER TABLE "new_Utility" RENAME TO "Utility";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
