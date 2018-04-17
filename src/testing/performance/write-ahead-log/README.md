# Performance of Write-Ahead Log (WAL)

"In computer science, write-ahead logging (WAL) is a family of techniques for providing atomicity and durability (two of the ACID properties) in database systems." ~ [Wikipedia](https://en.wikipedia.org/wiki/Write-ahead_logging)

## Reads

![](https://github.com/barend-erasmus/pangolin/raw/master/images/write-ahead-log-read.png)

### Disk

* Each log entry consumes a block of up-to 24 bytes which allows for fast reading with minimal seek time.

| Type | # of Records | Time taken in ms | Records per second |
| ---- | ------------ | ---------------- | ------------------ |
| HDD  | 5 000        | 157              | 31 847.1337        |
| SSD  | 5 000        | 150              | 33 333.3333        |

### In-Memory

* Each log entry are stored in an in-memory array.

| # of Records | Time taken in ms | Records per second |
| ------------ | ---------------- | ------------------ |
| 5 000        | 6                | 833 333.3333       |

### Disk with In-Memory Buffer

* The last `x` number of log entries are stored in an in-memory array which allow for fast reading of the last `x` number of log entries.

| Type | # of Records | Buffer Size | Time taken in ms | Records per second |
| ---- | ------------ | ----------- | ---------------- | ------------------ |
| HDD  | 5 000        | 50          | 163              | 30 674.8466        |
| HDD  | 5 000        | 100         | 160              | 31 250             |
| HDD  | 5 000        | 500         | 154              | 32 467.5324        |
| HDD  | 5 000        | 1 000       | 149              | 33 557.0469        |
| HDD  | 5 000        | 2 000       | 171              | 29 239.7660        |
| SSD  | 5 000        | 50          | 133              | 37 593.9849        |
| SSD  | 5 000        | 100         | 130              | 38 461.5384        |
| SSD  | 5 000        | 500         | 128              | 39 062.50000       |
| SSD  | 5 000        | 1 000       | 130              | 38 461.5384        |
| SSD  | 5 000        | 2 000       | 110              | 45 454.5454        |

## Writes

![](https://github.com/barend-erasmus/pangolin/raw/master/images/write-ahead-log-write.png)

### Disk

* Log entries are synced to disk after every write, reducing the risk of losing logs in the event of a failure.

| Type | # of Records | Time taken in ms | Records per second |
| ---- | ------------ | ---------------- | ------------------ |
| HDD  | 5 000        | 168 755          | 29.628             |
| SSD  | 5 000        | 504              | 942.6847           |

### In-Memory


| # of Records | Time taken in ms | Records per second |
| ------------ | ---------------- | ------------------ |
| 5 000        | 12               | 416 666.6666       |

### Disk with In-Memory Buffer

* Log entries are synced to disk after every `x` number of logs which increases write speeds and only a small number of logs will be lost in the event of a failure.

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
