import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import PQueue from 'p-queue';

export class FingerprintManager {
    constructor() {
        this.queue = new PQueue({ concurrency: 1 });
    }

    // Fetches and updates fingerprint from the database
    async fetchAndUpdateFingerprint() {
        return this.queue.add(async () => {
            try {
                const db = await open({
                    filename: 'data/fingerprints.db',
                    driver: sqlite3.Database
                });
                const result = await db.get(`SELECT value FROM fingerprint ORDER BY usedAt ASC LIMIT 1`);

                if (!result) {
                    console.warn('No fingerprints available in the database.');
                    return null; // Handle case where no fingerprint is available
                }

                await db.run(`UPDATE fingerprint SET usedAt = ? WHERE value = ?`, [Date.now(), result.value]);
                return JSON.parse(result.value);
            } catch (error) {
                console.error(`Error fetching fingerprint: ${error.message}`);
                throw error;
            }
        });
    }


    async addFingerprint(fingerprint) {
        const db = await open({
            filename: 'data/fingerprints.db',
            driver: sqlite3.Database
        });
        await db.run(`INSERT INTO fingerprint (value, usedAt) VALUES (?, ?)`, [JSON.stringify(fingerprint), Date.now()]);
    }
}
