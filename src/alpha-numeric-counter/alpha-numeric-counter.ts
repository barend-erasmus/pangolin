export class AlphaNumericCounter {

    private characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

    constructor(
        private value: string,
    ) {

    }

    public incrementBy(value: number): string {
        const indexes: number[] = this.value.split('').map((x) => this.characters.indexOf(x));

        indexes[indexes.length - 1] += value;

        this.balance(indexes);

        return indexes.map((x) => this.characters[x]).join('');
    }

    protected balance(indexes: number[]): number[] {
        for (let index = indexes.length - 1; index > 0; index--) {
            if (indexes[index] >= this.characters.length - 1) {
                indexes[index - 1] += Math.floor(indexes[index] / this.characters.length);
                indexes[index] = indexes[index] % this.characters.length;
            }
        }

        if (indexes[0] >= this.characters.length - 1) {
            indexes.unshift(Math.floor(indexes[0] / this.characters.length) - 1);
            indexes[1] = indexes[1] % this.characters.length;
        }

        return indexes;
    }
}
