import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { Command } from '@bot/commands/Command';
import localize from '@i18n/localize';

export class SetupCommand extends Command {
    public data = new SlashCommandBuilder()
        .setName('setup')
        .setDescription('Register current channel as an alerting channel.');

    public async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        if (interaction.channel) {
            this.getManager(interaction)?.addAlertChannel(interaction.channel.id);
            await interaction.reply({
                ephemeral: true,
                content: localize.__('commands.channel_added')
            });
        }
    }
}
