import { Message } from 'discord.js';
import { Command } from '@bot/command';
import { EventBus, EventBusTopic } from '@bot/event-bus';

export class ServiceCreateCommand extends Command {
    constructor(eventBus: EventBus) {
        super(eventBus, 'service', true);
    }

    public async run(message: Message, params: string[]): Promise<void> {
        if (params.length < 2) {
            await message.reply('Usage: m$ service <type> <endpoint>');
            return;
        }

        const type = params[0];
        const endpoint = params[1];

        this.eventBus.publish(EventBusTopic.SERVICE_CREATE, { type, options: { endpoint } });
        await message.delete();
    }
}
