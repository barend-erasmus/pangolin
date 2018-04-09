# Performance of Write Ahead Log (WAL)

## Writes

### Disk

| Type | # of Records | Time taken in ms | Records per second |
| ---- | ------------ | ---------------- | ------------------ |
| HDD  | 5 000        | 168 755          | 29.628             |
| SSD  | 5 000        | 5 04             | 942.6847           |


### In-Memory

| # of Records | Time taken in ms | Records per second |
| ------------ | ---------------- | ------------------ |
| 5 000        | 1                | 5 000 000          |

### Disk with In-Memory Buffer

| Type | # of Records | Buffer Size | Time taken in ms | Records per second |
| ---- | ------------ | ----------- | ---------------- | ------------------ |
| HDD  | 5 000        | 50          | 3 135            | 1 594.8963         |
| HDD  | 5 000        | 100         | 4 906            | 1 019.1602         |
| HDD  | 5 000        | 500         | 319              | 15 763.9811        |
| HDD  | 5 000        | 1 000       | 181              | 27 624.30939       |
| HDD  | 5 000        | 2 000       | 119              | 42 016.8067        |
| SSD  | 5 000        | 50          | 151              | 33 112.5827        |
| SSD  | 5 000        | 100         | 104              | 48 076.9230        |
| SSD  | 5 000        | 500         | 41               | 121 951.2195       |
| SSD  | 5 000        | 1 000       | 30               | 166 666.6666       |
| SSD  | 5 000        | 2 000       | 30               | 166 666.6666       |
