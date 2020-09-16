# Migration `20200904064023-user-model`

This migration has been generated by dohaicuong at 9/4/2020, 4:40:23 PM.
You can check out the [state of the schema](./schema.prisma) after the migration.

## Database Steps

```sql
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "avatar" TEXT,
PRIMARY KEY ("id")
)

CREATE UNIQUE INDEX "User.email_unique" ON "User"("email")

PRAGMA foreign_keys=off;
DROP TABLE "World";
PRAGMA foreign_keys=on
```

## Changes

```diff
diff --git schema.prisma schema.prisma
migration 20200904062822-init..20200904064023-user-model
--- datamodel.dml
+++ datamodel.dml
@@ -1,14 +1,16 @@
 datasource db {
   provider = "sqlite"
-  url = "***"
+  url = "***"
 }
 generator prisma_client {
   provider = "prisma-client-js"
 }
-     
-model World {
-  id         Int    @id @default(autoincrement())
-  name       String @unique
-  population Float
-}
+
+model User {
+  id       String @id @default(cuid())
+  email    String @unique
+  password String
+  name     String
+  avatar   String?
+}
```

