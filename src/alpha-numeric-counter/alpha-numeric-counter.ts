import * as BigNumber from 'big-number';

export class AlphaNumericCounter {

    private characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

    constructor(
        private value: BigNumber,
    ) {

    }

    public decrement(value: BigNumber): BigNumber {
        this.value = this.value.minus(value);

        return BigNumber(this.value);
    }

    public difference(value: BigNumber): BigNumber {
        return BigNumber(this.value.minus(value));
    }

    public get(): BigNumber {
        return BigNumber(this.value);
    }

    public increment(value: BigNumber): BigNumber {
        this.value = this.value.plus(value);

        return BigNumber(this.value);
    }

    public toString(): string {
        if (this.value.lt(1)) {
            return this.characters[0];
        }

        let convertionValue: BigNumber = BigNumber(this.value.toString());

        let workingValue: BigNumber = BigNumber(this.value.toString());

        let result: string = '';

        while (workingValue.gt(0)) {
            convertionValue = workingValue.mod(this.characters.length);

            result = this.characters[convertionValue] + result;

            workingValue = workingValue.divide(this.characters.length);
        }

        return result;
    }

}
