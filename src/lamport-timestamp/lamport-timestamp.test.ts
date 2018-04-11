import { expect } from 'chai';
import 'mocha';
import { LamportTimestamp } from './lamport-timestamp';

describe('LamportTimestamp', () => {

    describe('compare', () => {

        it('should return -1 given LT1 < LT2', async () => {
            const result: number = LamportTimestamp.compare(1, 2);

            expect(result).to.be.eq(-1);
        });

        it('should return 0 given LT1 = LT2', async () => {
            const result: number = LamportTimestamp.compare(1, 1);

            expect(result).to.be.eq(0);
        });

    });

});
