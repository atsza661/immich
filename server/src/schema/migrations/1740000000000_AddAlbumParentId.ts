import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('albums')
    .addColumn('parentId', 'uuid', (col) =>
      col.references('albums.id').onDelete('set null').defaultTo(null),
    )
    .execute();

  await sql`CREATE INDEX "IDX_albums_parentId" ON albums ("parentId")`.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  await sql`DROP INDEX IF EXISTS "IDX_albums_parentId"`.execute(db);

  await db.schema
    .alterTable('albums')
    .dropColumn('parentId')
    .execute();
}
