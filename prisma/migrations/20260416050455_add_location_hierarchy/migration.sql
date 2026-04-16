-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_locations" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "company" TEXT DEFAULT 'LeadTech',
    "parent_id" INTEGER,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "locations_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "locations" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_locations" ("company", "created_at", "id", "name", "updated_at") SELECT "company", "created_at", "id", "name", "updated_at" FROM "locations";
DROP TABLE "locations";
ALTER TABLE "new_locations" RENAME TO "locations";
CREATE UNIQUE INDEX "locations_name_parent_id_key" ON "locations"("name", "parent_id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
