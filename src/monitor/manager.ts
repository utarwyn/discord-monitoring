import { EventBus, EventBusTopic } from '@bot/event-bus';
import { MonitoringDatabase } from '@database/index';
import { GuildChannel } from '@database/schemas/guild-channel';
import { DatabaseStatementEnum } from '@database/statement';
import { Service } from '@monitor/service';
import { CachetService } from '@monitor/services/cachet-service';

/**
 * @author Utarwyn
 * @since 1.0.0
 */
export class MonitoringManager {
    public readonly eventBus: EventBus;

    private readonly guildId: string;

    private readonly database: MonitoringDatabase;

    private services: Service[];

    private _alertChannels: string[];

    constructor(eventBus: EventBus, guildId: string, database: MonitoringDatabase) {
        this.eventBus = eventBus;
        this.guildId = guildId;
        this.database = database;
        this.services = [new CachetService(this, 'https://demo.cachethq.io')];
        this._alertChannels = [];
    }

    public get alertChannels(): string[] {
        return this._alertChannels;
    }

    public async start(): Promise<void> {
        this._alertChannels = (
            await this.database.findAll<GuildChannel>(
                DatabaseStatementEnum.FIND_GUILD_CHANNELS,
                this.guildId
            )
        )?.map(guild => guild.channel_id);

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
