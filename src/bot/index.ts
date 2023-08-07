import { Client, EmbedBuilder, Events, HexColorString } from 'discord.js';
import localize from '@i18n/localize';
import { IncidentUpdateState, ManagerClient } from '@monitor/managers/manager-client';
import { ManagerFactory } from '@monitor/managers/manager-factory';
import { CommandManager } from '@bot/CommandManager';

export class MonitoringBot implements ManagerClient {
    private readonly managerFactory: ManagerFactory;

    private readonly commandManager: CommandManager;

    private client?: Client;

    constructor(managerFactory: ManagerFactory) {
        this.managerFactory = managerFactory;
        this.commandManager = new CommandManager(managerFactory);
    }

    public attachToClient(client: Client): void {
        this.client = client;

        client.on(Events.ClientReady, () => {
            client.guilds.cache.map(guild => this.managerFactory.createManager(this, guild.id));
        });
        client.on(Events.InteractionCreate, async interaction => {
            if (!interaction.isChatInputCommand()) return;
            await this.commandManager.handleInteraction(interaction);
        });
        client.on(
            Events.MessageCreate,
            this.commandManager.handleDeployMessage.bind(this.commandManager)
        );
    }

    public async updateIncident({
        channelId,
        messageId,
        mentions,
        incident
    }: IncidentUpdateState): Promise<string | undefined> {
        const embed = new EmbedBuilder()
            .setTitle(incident.title)
            .setColor(
                localize.__(`incident.colors.${incident.status.toLowerCase()}`) as HexColorString
            )
            .addFields({
                name: localize.__('common.status'),
                value: localize.__(`incident.status.${incident.status.toLowerCase()}`)
            })
            .setTimestamp(incident.updatedAt)
            .setDescription(incident.content);

        const channel = await this.client?.channels?.fetch(channelId);
        if (channel?.isTextBased()) {
            const message = await channel.messages?.fetch(messageId);
            if (message?.editable) {
                await message.edit({ embeds: [embed] });
            } else {
                const content =
                    mentions?.length > 0 ? mentions.map(roleId => `<@&${roleId}>`).join(' ') : '';
                return (await channel.send({ embeds: [embed], content })).id;
            }
        }
    }
}
