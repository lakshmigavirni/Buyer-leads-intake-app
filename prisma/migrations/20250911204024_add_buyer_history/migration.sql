-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_BuyerHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "buyerId" TEXT NOT NULL,
    "changedBy" TEXT NOT NULL,
    "changedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diff" JSONB NOT NULL,
    CONSTRAINT "BuyerHistory_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "Buyer" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_BuyerHistory" ("buyerId", "changedAt", "changedBy", "diff", "id") SELECT "buyerId", "changedAt", "changedBy", "diff", "id" FROM "BuyerHistory";
DROP TABLE "BuyerHistory";
ALTER TABLE "new_BuyerHistory" RENAME TO "BuyerHistory";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
