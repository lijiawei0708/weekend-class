# Migration `20200925122453`

This migration has been generated by chrisli at 9/25/2020, 10:24:53 PM.
You can check out the [state of the schema](./schema.prisma) after the migration.

## Database Steps

```sql
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
PRIMARY KEY ("id")
)
```

## Changes

```diff
diff --git schema.prisma schema.prisma
migration 20200918233404..20200925122453
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
@@ -28,8 +28,17 @@
 model Like {
   id        String  @id @default(cuid())
   post      Post    @relation(fields: [postId], references: [id])
   postId    String  
-  user      User     @relation(fields: [userId], references: [id])
+  user      User    @relation(fields: [userId], references: [id])
   userId    String     
 }
+model Comment {
+  id        String   @id @default(cuid())
+  content   String
+  post      Post     @relation(fields: [postId],references: [id])
+  postId    String 
+  author    User     @relation(fields: [userId], references: [id])
+  userId    String
+  createdAt DateTime @default(now())
+}
```


