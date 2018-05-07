import { Command } from './command';

export class PublishCommand extends Command {

    constructor(channel: string, public data: any) {
        super(channel, 'publish');
    }

}
