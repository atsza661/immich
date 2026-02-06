import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  // Add parent_album_id column to album table
  await sql`
    ALTER TABLE "album"
    ADD COLUMN "parentAlbumId" uuid;
  `.execute(db);

  // Add foreign key constraint for parent album
  await sql`
    ALTER TABLE "album"
    ADD CONSTRAINT "FK_album_parentAlbumId"
    FOREIGN KEY ("parentAlbumId") REFERENCES "album"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
  `.execute(db);

  // Create index for faster queries
  await sql`
    CREATE INDEX "IDX_album_parentAlbumId" ON "album"("parentAlbumId");
  `.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  // Drop index
  await sql`DROP INDEX IF EXISTS "IDX_album_parentAlbumId";`.execute(db);

  // Drop foreign key constraint
  await sql`
    ALTER TABLE "album"
    DROP CONSTRAINT IF EXISTS "FK_album_parentAlbumId";
  `.execute(db);

  // Drop column
  await sql`
    ALTER TABLE "album"
    DROP COLUMN "parentAlbumId";
  `.execute(db);
}
