import { Message } from 'discord.js';
import { Command } from '@bot/command';
import { EventBus, EventBusTopic } from '@bot/event-bus';

export class SetupCommand extends Command {
    constructor(eventBus: EventBus) {
        super(eventBus, 'setup');
    }

    async run(message: Message): Promise<void> {
        await message.delete();
        this.eventBus.publish(EventBusTopic.DISCORD_GUILD_CHANNEL_SETUP, {
            guildId: message.guild?.id,
            channelId: message.channel?.id
        });
    }
}
