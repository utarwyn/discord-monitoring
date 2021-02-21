import { Client, Message, MessageEmbed, TextChannel } from 'discord.js';
import { Command } from '@bot/command';
import { SetupCommand } from '@bot/commands/setup';
import { EventBus, EventBusTopic } from '@bot/event-bus';
import localize from '@config/localize';

export class MonitoringBot {
    private readonly eventBus: EventBus;

    private readonly commandPrefix: string;

    private readonly commands: Command[];

    private client?: Client;

    constructor(eventBus: EventBus, commandPrefix: string) {
        this.eventBus = eventBus;
        this.commandPrefix = commandPrefix;

        this.eventBus.subscribe(EventBusTopic.INCIDENT_UPDATE, this.updateIncident.bind(this));

        this.commands = [new SetupCommand(eventBus)];
    }

    public attachToClient(client: Client): void {
        this.client = client;

        client.on('ready', () => {
            client.guilds.cache.map(guild =>
                this.eventBus.publish(EventBusTopic.DISCORD_GUILD_CONNECT, guild.id)
            );
        });
        client.on('message', this.onMessage.bind(this));
        client.on('error', console.error);
    }

    private onMessage(message: Message): void {
        if (!message.author.bot && message.content?.startsWith(this.commandPrefix)) {
            const content = message.content?.substring(this.commandPrefix.length + 1);
            const command = this.commands.find(cmd => content.startsWith(cmd.name));

            if (command) {
                command.run(message, content.substring(command.name.length + 1).split(' '));
            } else {
                console.error('command not found for', content);
            }
        }
    }

    private updateIncident({
        channels,
        incident
    }: {
        channels: string[];
        incident: { [key: string]: any };
    }): void {
        channels.forEach(async channelId => {
            const channel = await this.client?.channels.fetch(channelId);
            if (channel instanceof TextChannel) {
                channel.send(
                    new MessageEmbed()
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
                        .setDescription(incident.content)
                );
            }
        });
    }
}
