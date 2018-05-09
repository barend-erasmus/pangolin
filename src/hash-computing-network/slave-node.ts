import * as BigNumber from 'big-number';
import { IHashAlgorithm, MD5 } from 'majuro';
import { BigNumberHelper } from './big-number-helper';
import { HashTaskRange } from './hash-task-range';

export class SlaveNode {

    constructor() {

    }

    public computeHashTaskRange(hashTaskRange: HashTaskRange): string {
        const hashAlgorithm: IHashAlgorithm = new MD5();

        let value: BigNumber = BigNumber(hashTaskRange.start);

        const endValue: BigNumber = BigNumber(hashTaskRange.end);

        while (value.lte(endValue)) {
            const str: string = BigNumberHelper.toString(value, 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890'.split(''));

            if (hashAlgorithm.calculate(str).toLowerCase() === hashTaskRange.result.toLowerCase()) {
                return str;
            }

            value = value.add(1);
        }

        return null;
    }

}
