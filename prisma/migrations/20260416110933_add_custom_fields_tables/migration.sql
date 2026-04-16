/*
  Warnings:

  - You are about to drop the column `custom_fields` on the `assets` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "custom_fields" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "field_key" TEXT NOT NULL,
    "field_label" TEXT NOT NULL,
    "field_type" TEXT NOT NULL,
    "field_options" TEXT,
    "section" TEXT,
    "is_required" BOOLEAN NOT NULL DEFAULT false,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "custom_field_values" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "asset_id" INTEGER NOT NULL,
    "field_key" TEXT NOT NULL,
    "field_value" TEXT,
    "field_value_json" JSONB,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "custom_field_values_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "assets" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

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
INSERT INTO "new_assets" ("address", "asset_code", "asset_cost", "asset_name", "assigned_date", "assigned_notes", "assigned_to", "category_id", "city", "client_id", "commissioning_date", "country", "created_at", "created_by", "current_asset_value", "department_id", "depreciation", "depreciation_period", "description", "expected_return", "id", "installation_date", "latitude", "location_id", "longitude", "make", "manufacturer", "model", "photos", "purchase_date", "qr_image", "qr_url", "salvage_value", "serial_no", "state", "status", "tagged_by", "tagged_date", "tagged_id", "tagged_image", "tagged_status", "tagged_video", "updated_at", "useful_life", "videos") SELECT "address", "asset_code", "asset_cost", "asset_name", "assigned_date", "assigned_notes", "assigned_to", "category_id", "city", "client_id", "commissioning_date", "country", "created_at", "created_by", "current_asset_value", "department_id", "depreciation", "depreciation_period", "description", "expected_return", "id", "installation_date", "latitude", "location_id", "longitude", "make", "manufacturer", "model", "photos", "purchase_date", "qr_image", "qr_url", "salvage_value", "serial_no", "state", "status", "tagged_by", "tagged_date", "tagged_id", "tagged_image", "tagged_status", "tagged_video", "updated_at", "useful_life", "videos" FROM "assets";
DROP TABLE "assets";
ALTER TABLE "new_assets" RENAME TO "assets";
CREATE UNIQUE INDEX "assets_asset_code_key" ON "assets"("asset_code");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "custom_fields_field_key_key" ON "custom_fields"("field_key");

-- CreateIndex
CREATE UNIQUE INDEX "custom_field_values_asset_id_field_key_key" ON "custom_field_values"("asset_id", "field_key");
