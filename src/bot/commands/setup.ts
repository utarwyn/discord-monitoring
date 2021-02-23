import { Message } from 'discord.js';
import { Command } from '@bot/command';

export class SetupCommand extends Command {
    public name = 'setup';
    public admin = true;

    async run(message: Message): Promise<void> {
        await message.delete();
        this.getManager(message)?.addAlertChannel(message.channel?.id);
    }
}
