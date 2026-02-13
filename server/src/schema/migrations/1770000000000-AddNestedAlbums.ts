import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  // Add parentId column to album table for nested albums support
  await sql`ALTER TABLE "album" ADD COLUMN "parentId" uuid REFERENCES "album" ("id") ON DELETE CASCADE ON UPDATE CASCADE`.execute(
    db,
  );
  await sql`CREATE INDEX "IDX_album_parentId" ON "album" ("parentId")`.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  await sql`DROP INDEX "IDX_album_parentId"`.execute(db);
  await sql`ALTER TABLE "album" DROP COLUMN "parentId"`.execute(db);
}
