import * as BigNumber from 'big-number';

export class BigNumberHelper {

    public static toString(value: BigNumber, baseCharacters: string[]): string {
        let result: string = '';
        const targetBase: number = baseCharacters.length;

        do {
            result = baseCharacters[parseInt(BigNumber(value.toString()).mod(targetBase).toString(), undefined)] + result;
            value = BigNumber(value.toString()).divide(targetBase);
        } while (value.gt(0));

        return result;
    }

}
