import * as BigNumber from 'big-number';
import { expect } from 'chai';
import 'mocha';
import { AlphaNumericCounter } from './alpha-numeric-counter';

describe('AlphaNumericCounter', () => {

    describe('toString', () => {

        it('should return a', async () => {
            const alphaNumericCounter: AlphaNumericCounter = new AlphaNumericCounter(BigNumber(0));

            const result: string = alphaNumericCounter.toString();

            expect(result).to.be.eq('a');
        });

        it('should return b', async () => {
            const alphaNumericCounter: AlphaNumericCounter = new AlphaNumericCounter(BigNumber(1));

            const result: string = alphaNumericCounter.toString();

            expect(result).to.be.eq('b');
        });

        it('should return 9', async () => {
            const alphaNumericCounter: AlphaNumericCounter = new AlphaNumericCounter(BigNumber(61));

            const result: string = alphaNumericCounter.toString();

            expect(result).to.be.eq('9');
        });

    });

});
