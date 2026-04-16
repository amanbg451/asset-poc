/*
  Warnings:

  - You are about to drop the column `purchase_amount` on the `assets` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_assets" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "asset_code" TEXT NOT NULL,
    "asset_name" TEXT NOT NULL,
    "installation_date" DATETIME,
    "tagged_status" TEXT DEFAULT 'Not Tagged',
    "commissioning_date" DATETIME,
    "country" TEXT DEFAULT 'India',
    "state" TEXT,
    "city" TEXT,
    "serial_no" TEXT,
    "model" TEXT,
    "make" TEXT,
    "manufacturer" TEXT,
    "client_id" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "location_id" INTEGER,
    "department_id" INTEGER,
    "category_id" INTEGER,
    "depreciation_period" INTEGER,
    "asset_cost" REAL,
    "useful_life" INTEGER,
    "purchase_date" DATETIME,
    "current_asset_value" REAL,
    "salvage_value" REAL,
    "depreciation" TEXT,
    "photos" TEXT,
    "videos" TEXT,
    "qr_url" TEXT,
    "qr_image" TEXT,
    "latitude" REAL,
    "longitude" REAL,
    "address" TEXT,
    "tagged_date" DATETIME,
    "tagged_id" TEXT,
    "tagged_image" TEXT,
    "tagged_video" TEXT,
    "assigned_to" INTEGER,
    "assigned_date" DATETIME,
    "expected_return" DATETIME,
    "assigned_notes" TEXT,
    "created_by" INTEGER,
    "tagged_by" INTEGER,
    "description" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "assets_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "assets_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "assets_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "assets_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "assets_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_assets" ("asset_code", "asset_name", "assigned_date", "assigned_notes", "assigned_to", "category_id", "created_at", "created_by", "department_id", "description", "expected_return", "id", "location_id", "purchase_date", "status", "updated_at") SELECT "asset_code", "asset_name", "assigned_date", "assigned_notes", "assigned_to", "category_id", "created_at", "created_by", "department_id", "description", "expected_return", "id", "location_id", "purchase_date", "status", "updated_at" FROM "assets";
DROP TABLE "assets";
ALTER TABLE "new_assets" RENAME TO "assets";
CREATE UNIQUE INDEX "assets_asset_code_key" ON "assets"("asset_code");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
