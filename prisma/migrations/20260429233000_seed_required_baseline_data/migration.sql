-- Seed baseline data required by auth and order flows.
-- Keep idempotent to support re-runs safely.

INSERT INTO "roles" ("id", "name", "description", "created_at")
VALUES
  ('674f60b8-b236-4fd6-8bd2-a89dd72d9c5b', 'user', 'Utilizador normal', NOW()),
  ('f26efa71-5df2-4694-baef-d2fd3768f465', 'admin', 'Administrador', NOW())
ON CONFLICT ("name")
DO UPDATE SET "description" = EXCLUDED."description";

INSERT INTO "payment_conditions" (
  "id",
  "name",
  "description",
  "installments",
  "days_between",
  "is_default",
  "is_active",
  "created_at",
  "updated_at"
)
VALUES
  ('9de0b570-e8fb-4e76-a4d2-644e9f8ee6fd', 'A Vista', NULL, 1, NULL, true, true, NOW(), NOW()),
  ('6cee5e74-eb5f-4b17-8d84-fd6d70f9546f', '30 dias', NULL, 1, 30, false, true, NOW(), NOW()),
  ('0807bf97-4f8f-42a1-b4a9-a0f7da6e9ff7', '30/60 dias', NULL, 2, 30, false, true, NOW(), NOW()),
  ('3c5a1237-6103-4bc3-8f26-053fd5561ea9', '30/60/90 dias', NULL, 3, 30, false, true, NOW(), NOW())
ON CONFLICT ("name")
DO UPDATE SET
  "description" = EXCLUDED."description",
  "installments" = EXCLUDED."installments",
  "days_between" = EXCLUDED."days_between",
  "is_default" = EXCLUDED."is_default",
  "is_active" = EXCLUDED."is_active",
  "updated_at" = NOW();

UPDATE "payment_conditions"
SET
  "is_default" = false,
  "updated_at" = NOW()
WHERE "name" <> 'A Vista' AND "is_default" = true;

UPDATE "payment_conditions"
SET
  "is_default" = true,
  "updated_at" = NOW()
WHERE "name" = 'A Vista' AND "is_default" = false;
