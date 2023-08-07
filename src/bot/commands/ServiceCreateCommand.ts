import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { Command } from '@bot/commands/Command';
import localize from '@i18n/localize';

export class ServiceCreateCommand extends Command {
    public data = new SlashCommandBuilder()
        .setName('services')
        .setDescription('Manage services.')
        .addSubcommand(command =>
            command
                .setName('create')
                .setDescription('Add a service to follow based on its type and endpoint.')
                .addStringOption(option =>
                    option
                        .setName('type')
                        .setDescription('Type of the service.')
                        .setRequired(true)
                        .setChoices({ name: 'CachetHQ', value: 'cachet' })
                )
                .addStringOption(option =>
                    option
                        .setName('endpoint')
                        .setDescription('Endpoint of the service.')
                        .setRequired(true)
                )
                .addRoleOption(option =>
                    option
                        .setName('role')
                        .setDescription('Role to mention when an incident is found')
                )
        );

    public async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        const serviceType = interaction.options.getString('type')!;
        const endpoint = interaction.options.getString('endpoint')!;
        const roleMention = interaction.options.getRole('role');

        this.getManager(interaction)?.addService(serviceType, {
            endpoint,
            mentions: roleMention ? [roleMention.id] : [],
            filters: {}
        });

        await interaction.reply({
            ephemeral: true,
            content: localize.__('commands.service_added')
        });
    }
}
