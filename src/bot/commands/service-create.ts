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

        this.getManager(message)?.addService(type, { endpoint });
        await message.delete();
    }
}
