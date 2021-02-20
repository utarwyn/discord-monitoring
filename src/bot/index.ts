import { Client, MessageEmbed, TextChannel } from 'discord.js';
import { EventBus, EventBusTopic } from '@bot/event-bus';
import localize from '@config/localize';

export class MonitoringBot {
    private readonly eventBus: EventBus;

    private channel?: TextChannel;

    constructor(eventBus: EventBus) {
        this.eventBus = eventBus;
        this.eventBus.subscribe(EventBusTopic.INCIDENT_UPDATE, this.updateIncident.bind(this));
    }

    public attachToClient(client: Client, channelId: string): void {
        client.on('ready', async () => {
            const channel = await client?.channels.fetch(channelId);
            if (channel instanceof TextChannel) {
                this.channel = channel;
                this.eventBus.publish(EventBusTopic.BOT_CONNECTED);
            } else {
                throw new Error('provided channel must exists and be textual');
            }
        });
        client.on('error', console.error);
    }

    private updateIncident({
        title,
        status,
        content,
        updatedAt
    }: {
        title: string;
        status: string;
        content: string;
        updatedAt: Date;
    }): void {
        this.channel?.send(
            new MessageEmbed()
                .setTitle(title)
                .setColor(localize.__(`incident.colors.${status.toLowerCase()}`))
                .addField(
                    localize.__('common.status'),
                    localize.__(`incident.status.${status.toLowerCase()}`)
                )
                .addField(
                    localize.__('common.updated-at'),
                    updatedAt.toLocaleString(localize.getLanguage())
                )
                .setDescription(content)
        );
    }
}
