import { MonitoringDatabase } from '@database/index';
import { GuildChannelSchema } from '@database/schemas/guild-channel.schema';
import { ServiceSchema } from '@database/schemas/service.schema';
import { DatabaseStatementEnum } from '@database/statement';
import { Service, ServiceOptions } from '@monitor/service';
import { ServiceFactory } from '@monitor/services/factory';
import { ManagerClient } from '@monitor/managers/manager-client';

/**
 * @author Utarwyn
 * @since 1.0.0
 */
export class MonitoringManager {
    public readonly client: ManagerClient;

    public readonly database: MonitoringDatabase;

    public readonly guildId: string;

    private services: Service<any>[];

    private _alertChannels: string[];

    constructor(client: ManagerClient, guildId: string, database: MonitoringDatabase) {
        this.client = client;
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

    public async addService(type: string, options: ServiceOptions): Promise<void> {
        try {
            const insertion = await this.database.run(
                DatabaseStatementEnum.INSERT_SERVICE,
                this.guildId,
                type,
                JSON.stringify(options)
            );

            const service = ServiceFactory.create(this, type, insertion.lastID, options);
            this.services.push(service);
            service.start();
        } catch (e) {
            console.error(e);
        }
    }

    private update(): void {
        this.services.forEach(service => service.execute());
    }
}
