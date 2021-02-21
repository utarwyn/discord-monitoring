import { EventBus, EventBusTopic } from '@bot/event-bus';
import { MonitoringDatabase } from '@database/index';
import { GuildChannelSchema } from '@database/schemas/guild-channel.schema';
import { ServiceSchema } from '@database/schemas/service.schema';
import { DatabaseStatementEnum } from '@database/statement';
import { Service } from '@monitor/service';
import { ServiceFactory } from '@monitor/services/factory';

/**
 * @author Utarwyn
 * @since 1.0.0
 */
export class MonitoringManager {
    public readonly eventBus: EventBus;

    private readonly guildId: string;

    private readonly database: MonitoringDatabase;

    private services: Service<any>[];

    private _alertChannels: string[];

    constructor(eventBus: EventBus, guildId: string, database: MonitoringDatabase) {
        this.eventBus = eventBus;
        this.guildId = guildId;
        this.database = database;
        this.services = [];
        this._alertChannels = [];
    }

    public get alertChannels(): string[] {
        return this._alertChannels;
    }

    public async start(): Promise<void> {
        // Retrieve guild alertable channels
        this._alertChannels = (
            await this.database.findAll<GuildChannelSchema>(
                DatabaseStatementEnum.FIND_GUILD_CHANNELS,
                this.guildId
            )
        )?.map(guild => guild.channel_id);

        // Retrieve guild services
        this.services = (
            await this.database.findAll<ServiceSchema>(
                DatabaseStatementEnum.FIND_SERVICES,
                this.guildId
            )
        )?.map(service =>
            ServiceFactory.create(this, service.type, service.id, JSON.parse(service.options))
        );

        // TODO only subscribe on a specific guild
        this.eventBus.subscribe(EventBusTopic.DISCORD_GUILD_CHANNEL_SETUP, ({ channelId }) => {
            this.addAlertChannel(channelId);
        });

        this.services.forEach(service => service.start());
        setInterval(this.update.bind(this), 60000);
    }

    public async addAlertChannel(channelId: string): Promise<void> {
        if (!this.alertChannels.includes(channelId)) {
            this.alertChannels.push(channelId);
            await this.database.run(
                DatabaseStatementEnum.INSERT_GUILD_CHANNEL,
                this.guildId,
                channelId
            );
        }
    }

    private update(): void {
        this.services.forEach(service => service.execute());
    }
}
