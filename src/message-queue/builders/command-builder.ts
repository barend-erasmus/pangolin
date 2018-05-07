import { Command } from '../commands/command';
import { PublishCommand } from '../commands/publish';
import { SubscribeCommand } from '../commands/subscribe';

export class CommandBuilder {

    constructor() {

    }

    public build(obj: any): Command {
        switch (obj.type) {
            case 'publish':
                return new PublishCommand(obj.channel, obj.data);
            case 'subscribe':
                return new SubscribeCommand(obj.channel);
            default:
             throw new Error('Unsupported Command');
        }
    }

}
