import { expect } from 'chai';
import 'mocha';
import { AlphaNumericCounter } from './alpha-numeric-counter';

describe('AlphaNumericCounter', () => {

    const alphaNumericCounter: AlphaNumericCounter = new AlphaNumericCounter('a');

    describe('decrementBy', () => {

        it('a9 by 5 = a4', async () => {
            alphaNumericCounter.set('a9');

            const result: string = alphaNumericCounter.decrementBy(5);

            expect(result).to.be.eq('a4');
        });

        it('a9 by 61 = aa', async () => {
            alphaNumericCounter.set('a9');

            const result: string = alphaNumericCounter.decrementBy(61);

            expect(result).to.be.eq('aa');
        });

        it('a9 by 62 = 9', async () => {
            alphaNumericCounter.set('a9');

            const result: string = alphaNumericCounter.decrementBy(62);

            expect(result).to.be.eq('9');
        });

    });

});
