import { expect } from 'chai';
import 'mocha';
import { VectorClock } from '../vector-clock/vector-clock';
import { DataStore } from './data-store';
import { LogEntry } from './models/log-entry';

describe('DataStore', () => {

    let dataStore: DataStore = null;

    afterEach(() => {
        dataStore = null;
    });

    beforeEach(() => {
        dataStore = new DataStore(new VectorClock('1'));
    });

    describe('insertLogEntry', () => {

        it('should insert in sorted order', async () => {
            dataStore.insertLogEntry(new LogEntry('1', null, null, {
                1: 1,
            }));

            dataStore.insertLogEntry(new LogEntry('3', null, null, {
                1: 3,
            }));

            dataStore.insertLogEntry(new LogEntry('2', null, null, {
                1: 2,
            }));

            expect(dataStore.getLogEntries()[0].id).to.be.eq('1');
            expect(dataStore.getLogEntries()[1].id).to.be.eq('2');
            expect(dataStore.getLogEntries()[2].id).to.be.eq('3');
        });
    });

});
