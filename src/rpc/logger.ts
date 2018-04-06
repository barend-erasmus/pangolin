import winston from 'winston';

export class Logger {

    constructor() {
        winston.level = 'debug';
    }

    public debug(message: string, metadata: any = null): void {
        // winston.debug(message, metadata);
        console.log(message);
    }

    public error(message: string, metadata: any = null): void {
        // winston.error(message, metadata);
        console.log(message);
    }

    public info(message: string, metadata: any = null): void {
        // winston.info(message, metadata);
        console.log(message);
    }

    public trace(message: string, metadata: any = null): void {
        // winston.debug(message, metadata);
        console.log(message);
    }

}
