import { DataStoreEntry } from './models/data-store-entry';

export class DataStore {

    protected entries: DataStoreEntry[] = null;

    constructor() {
        this.entries = [];
    }

    public insert(entry: DataStoreEntry): void {
        this.entries.push(entry);
    }

    public get(): DataStoreEntry[] {
        return this.entries;
    }

}
