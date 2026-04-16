-- CreateTable
CREATE TABLE "locations" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "company" TEXT DEFAULT 'LeadTech',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_assets" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "asset_code" TEXT NOT NULL,
    "asset_name" TEXT NOT NULL,
    "category" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "purchase_date" DATETIME,
    "purchase_amount" REAL,
    "assigned_to" INTEGER,
    "created_by" INTEGER,
    "description" TEXT,
    "location_id" INTEGER,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "assets_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "assets_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "assets_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_assets" ("asset_code", "asset_name", "assigned_to", "category", "created_at", "created_by", "description", "id", "purchase_amount", "purchase_date", "status", "updated_at") SELECT "asset_code", "asset_name", "assigned_to", "category", "created_at", "created_by", "description", "id", "purchase_amount", "purchase_date", "status", "updated_at" FROM "assets";
DROP TABLE "assets";
ALTER TABLE "new_assets" RENAME TO "assets";
CREATE UNIQUE INDEX "assets_asset_code_key" ON "assets"("asset_code");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "locations_name_key" ON "locations"("name");
