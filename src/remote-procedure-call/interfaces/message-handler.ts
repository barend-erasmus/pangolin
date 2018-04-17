import { Message } from '../models/message';

export interface IMessageHandler {

    handle(message: Message): Promise<any>;

}
