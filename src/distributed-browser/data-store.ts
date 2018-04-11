import { DataStoreEntry } from './models/data-store-entry';

export class DataStore {

    protected entries: DataStoreEntry[] = null;

    protected index: number = 0;

    constructor() {
        this.entries = [];
    }

    public insert(entry: DataStoreEntry): boolean {
        if (entry.index === this.index + 1) {
            this.index = entry.index;
            this.entries.push(entry);
            return true;
        }

        return false;
    }

    public get(): DataStoreEntry[] {
        return this.entries;
    }

    public getLast(): DataStoreEntry {
        return this.entries.length === 0 ? null : this.entries[this.entries.length - 1];
    }

    public getNextIndex(): number {
        return this.index + 1;
    }

    public set(entries: DataStoreEntry[]): void {
        this.entries = entries;
    }

}
