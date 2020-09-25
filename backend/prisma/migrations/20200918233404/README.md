# Migration `20200918233404`

This migration has been generated by chrisli at 9/19/2020, 9:34:04 AM.
You can check out the [state of the schema](./schema.prisma) after the migration.

## Database Steps

```sql
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Post" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
PRIMARY KEY ("id")
);
INSERT INTO "new_Post" ("id", "content", "userId", "createdAt") SELECT "id", "content", "userId", "createdAt" FROM "Post";
DROP TABLE "Post";
ALTER TABLE "new_Post" RENAME TO "Post";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON
```

## Changes

```diff
diff --git schema.prisma schema.prisma
migration 20200918133845..20200918233404
--- datamodel.dml
+++ datamodel.dml
@@ -1,7 +1,7 @@
 datasource db {
   provider = "sqlite"
-  url = "***"
+  url = "***"
 }
 generator prisma_client {
   provider = "prisma-client-js"
@@ -18,9 +18,9 @@
 model Post {
   id        String   @id @default(cuid())
   content   String
-  like      Int       @default(0)  
+  likes      Like[]
   author    User     @relation(fields: [userId], references: [id])
   userId    String
   createdAt DateTime @default(now())
 }
```

