import { Message } from 'discord.js';
import { Command } from '@bot/command';

export class ServiceCreateCommand extends Command {
    public name = 'service';
    public admin = true;

    public async run(message: Message, params: string[]): Promise<void> {
        if (params.length < 2) {
            await message.reply('Usage: m$ service <type> <endpoint>');
            return;
        }

        const type = params[0];
        const endpoint = params[1];
        const mentions = message.mentions.roles.mapValues(role => role.id).array();

        this.getManager(message)?.addService(type, { endpoint, mentions });
        await message.delete();
    }
}
