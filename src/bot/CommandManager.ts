import { ChatInputCommandInteraction, Client, Message, Snowflake } from 'discord.js';
import { Command } from '@bot/commands/Command';
import { SetupCommand } from '@bot/commands/SetupCommand';
import { ServiceCreateCommand } from '@bot/commands/ServiceCreateCommand';
import { ManagerFactory } from '@monitor/managers/manager-factory';

export class CommandManager {
    private readonly commands: Command[];

    constructor(managerFactory: ManagerFactory) {
        this.commands = [
            new SetupCommand(managerFactory),
            new ServiceCreateCommand(managerFactory)
        ];
    }

    public async handleInteraction(interaction: ChatInputCommandInteraction): Promise<void> {
        const handler = this.commands.find(
            command => (command.data as any).name === interaction.commandName
        );

        if (!handler) {
            console.error(`No command matching ${interaction.commandName} was found.`);
            return;
        }

        try {
            await handler.execute(interaction);
        } catch (error) {
            console.error(error);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({
                    content: 'There was an error while executing this command!',
                    ephemeral: true
                });
            } else {
                await interaction.reply({
                    content: 'There was an error while executing this command!',
                    ephemeral: true
                });
            }
        }
    }

    public async handleDeployMessage(message: Message): Promise<void> {
        if (
            message.guild &&
            message.member &&
            message.client.user &&
            message.mentions.has(message.client.user) &&
            message.member.permissions.has('Administrator')
        ) {
            const words = message.content.split(' ');
            if (words.length === 2) {
                if (words.includes('deploy')) {
                    await this.registerInGuild(message.client, message.guild.id);
                    await message.reply('Commands have been registered.');
                } else if (words.includes('undeploy')) {
                    await this.deleteInGuild(message.client, message.guild.id);
                    await message.reply(`Commands have been unregistered.`);
                }
            }
        }
    }

    private async registerInGuild(client: Client, guildId: Snowflake): Promise<void> {
        for (const command of this.commands) {
            await client.application!.commands.create(command.data, guildId);
        }
    }

    private async deleteInGuild(client: Client, guildId: Snowflake): Promise<void> {
        const commands = client.application!.commands;
        const guildCommands = await commands.fetch({ guildId });
        for (const guildCommand of guildCommands.values()) {
            await commands.delete(guildCommand.id, guildId);
        }
    }
}
