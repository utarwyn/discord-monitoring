import { Client, MessageEmbed, TextChannel } from 'discord.js';
import { EventBus, EventBusTopic } from '@bot/event-bus';
import localize from '@config/localize';

export class MonitoringBot {
    private readonly eventBus: EventBus;

    private client?: Client;

    constructor(eventBus: EventBus) {
        this.eventBus = eventBus;
        this.eventBus.subscribe(EventBusTopic.INCIDENT_UPDATE, this.updateIncident.bind(this));
    }

    public attachToClient(client: Client): void {
        this.client = client;
        client.on('ready', () => {
            client.guilds.cache.map(guild =>
                this.eventBus.publish(EventBusTopic.DISCORD_GUILD_CONNECT, guild.id)
            );
        });
        client.on('error', console.error);
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
