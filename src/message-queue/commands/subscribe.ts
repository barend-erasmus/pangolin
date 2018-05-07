import { Command } from './command';

export class SubscribeCommand extends Command {

    constructor(channel: string) {
        super(channel, 'subscribe');
    }

}
