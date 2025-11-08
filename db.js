import { Kysely, SqliteDialect } from 'kysely'
import Database from 'better-sqlite3'

const db = new Kysely({
    dialect: new SqliteDialect({
        database: new Database('kanji.db')
    }),
})

class DBInterface {
    constructor(db) {
        this.db = db;
        db.schema
        .createTable('flashcards')
        .ifNotExists()
        .addColumn('id', 'integer', (col) => col.primaryKey().autoIncrement())
        .addColumn('kanji', 'text', (col) => col.notNull())
        .addColumn('meaning', 'text', (col) => col.notNull())
        .addColumn('onyomi', 'text', (col) => col.notNull().defaultTo(''))
        .addColumn('kunyomi', 'text', (col) => col.notNull().defaultTo(''))
        .execute()
    }

    async add_card(kanji, meaning, kunyomi, onyomi) {
        await this.db
            .insertInto('flashcards')
            .values({kanji, meaning, kunyomi, onyomi})
            .execute();
    }

    async bulk_delete_cards(array_of_ids) {
    await this.db
        .deleteFrom('flashcards')
        .where('id', 'in', array_of_ids)
        .execute();
    }

    async update_card(id, kanji, meaning, onyomi, kunyomi) {
    await this.db
        .updateTable('flashcards')
        .set({ kanji, meaning, onyomi, kunyomi })
        .where('id', '=', id)
        .execute();
    }

    async get_card(id) {  // returns a single card through id
        if (id != null) {
            const card = await this.db
            .selectFrom('flashcards')
            .selectAll()
            .where('id', '=', id)
            .executeTakeFirst()
        };
        return card ? [card]: []
    };

    async list_cards(n) {
    const query = this.db
        .selectFrom('flashcards')
        .selectAll()
        .orderBy('id', 'desc'); // newest first

    if (n == null) return await query.execute();
    return await query.limit(n).execute();
    };
}

export default new DBInterface(db);