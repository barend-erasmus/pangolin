# Alpha-Numeric Counter

## Usage Example

```typescript
import * as BigNumber from 'big-number';

const alphaNumericCounter: AlphaNumericCounter = new AlphaNumericCounter(BigNumber('1357924680'));

console.log(alphaNumericCounter.toString()); // DS8

alphaNumericCounter.increment(BigNumber(100));

console.log(alphaNumericCounter.toString()); // DSK
```