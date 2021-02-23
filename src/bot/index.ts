import { Client, Message, MessageEmbed, TextChannel } from 'discord.js';
import { Command } from '@bot/command';
import { ServiceCreateCommand } from '@bot/commands/service-create';
import { SetupCommand } from '@bot/commands/setup';
import localize from '@config/localize';
import { IncidentUpdateState, ManagerClient } from '@monitor/managers/manager-client';
import { ManagerFactory } from '@monitor/managers/manager-factory';

export class MonitoringBot implements ManagerClient {
    private readonly managerFactory: ManagerFactory;

    private readonly commandPrefix: string;

    private readonly commands: Command[];

    private client?: Client;

    constructor(managerFactory: ManagerFactory, commandPrefix: string) {
        this.managerFactory = managerFactory;
        this.commandPrefix = commandPrefix;
        this.commands = [
            new SetupCommand(managerFactory),
            new ServiceCreateCommand(managerFactory)
        ];
    }

    public attachToClient(client: Client): void {
        this.client = client;

        client.on('ready', () => {
            client.guilds.cache.map(guild => this.managerFactory.createManager(this, guild.id));
        });
        client.on('message', this.onMessage.bind(this));
        client.on('error', console.error);
    }

    private onMessage(message: Message): void {
        if (!message.author.bot && message.content?.startsWith(this.commandPrefix)) {
            const content = message.content?.substring(this.commandPrefix.length + 1);
            const command = this.commands.find(cmd => content.startsWith(cmd.name));

            if (command) {
                if (!command.admin || message.member?.hasPermission('ADMINISTRATOR')) {
                    command.run(message, content.substring(command.name.length + 1).split(' '));
                }
            }
        }
    }

    public async updateIncident({
        channelId,
        messageId,
        incident
    }: IncidentUpdateState): Promise<string | undefined> {
        const embed = new MessageEmbed()
            .setTitle(incident.title)
            .setColor(localize.__(`incident.colors.${incident.status.toLowerCase()}`))
            .addField(
                localize.__('common.status'),
                localize.__(`incident.status.${incident.status.toLowerCase()}`)
            )
            .addField(
                localize.__('common.updated-at'),
                incident.updatedAt.toLocaleString(localize.getLanguage())
            )
            .setDescription(incident.content);

        const channel = await this.client?.channels?.fetch(channelId);
        if (channel instanceof TextChannel) {
            const message = await channel.messages?.fetch(messageId);
            if (message?.editable) {
                await message.edit(embed);
            } else {
                return (await channel.send(embed)).id;
            }
        }
    }
}
