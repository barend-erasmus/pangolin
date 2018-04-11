import { expect } from 'chai';
import 'mocha';
import { VectorClock } from './vector-clock';

describe('VectorClock', () => {

    describe('compare', () => {

        it('should return -1 given VT1[i] = VT2[i] for all i = 1, ... ,N', async () => {
            const result: number = VectorClock.compare({
                1: 1,
                2: 1,
                3: 1,
            }, {
                    1: 1,
                    2: 1,
                    3: 1,
                });

            expect(result).to.be.eq(-1);
        });

        it('should return -1 given VT1[i] <= VT2[i] for all i = 1, ... ,N', async () => {
            const result: number = VectorClock.compare({
                1: 1,
                2: 0,
                3: 0,
            }, {
                    1: 2,
                    2: 0,
                    3: 0,
                });

            expect(result).to.be.eq(-1);
        });

        it('should return -1 given VT1[i] <= VT2[i] for all i = 1, ... ,N', async () => {
            const result: number = VectorClock.compare({
                1: 2,
                2: 0,
                3: 0,
            }, {
                    1: 2,
                    2: 2,
                    3: 1,
                });

            expect(result).to.be.eq(-1);
        });

        it('should return -1 given VT1[i] <= VT2[i] for all i = 1, ... ,N', async () => {
            const result: number = VectorClock.compare({
                1: 1,
                2: 0,
                3: 0,
            }, {
                    1: 2,
                    2: 2,
                    3: 1,
                });

            expect(result).to.be.eq(-1);
        });

        it('should return 0 given VT1 ||| VT2', async () => {
            const result: number = VectorClock.compare({
                1: 3,
                2: 0,
                3: 0,
            }, {
                    1: 2,
                    2: 2,
                    3: 1,
                });

            expect(result).to.be.eq(0);
        });

    });

});
