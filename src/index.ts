import { Client } from 'discord.js';
import { EventBus, EventBusTopic } from '@bot/event-bus';
import { MonitoringBot } from '@bot/index';
import { Config } from '@config/config';
import localize from '@config/localize';
import { MonitoringDatabase } from '@database/index';
import { MonitoringManager } from '@monitor/manager';

/**
 * Controls all interactions of the bot.
 *
 * @author Utarwyn
 * @since 1.0.0
 */
class Monitoring {
    private readonly configuration: Config;

    private readonly bot: MonitoringBot;

    private managers: MonitoringManager[];

    constructor(configuration: Config) {
        this.configuration = configuration;
        this.managers = [];

        if (configuration.language) {
            localize.setLanguage(configuration.language);
        }

        const eventBus = new EventBus();

        this.bot = new MonitoringBot(eventBus);
        this.setupManagers(eventBus);
    }

    public async login(token?: string): Promise<void> {
        const loginToken = token ?? this.configuration.token;

        if (!loginToken) {
            throw new Error('Bot token needed to start Discord client.');
        }

        const client = new Client();
        this.bot.attachToClient(client);
        await client.login(loginToken);
    }

    public attach(client: Client): void {
        this.bot.attachToClient(client);
    }

    private setupManagers(eventBus: EventBus): void {
        const database = new MonitoringDatabase(
            this.configuration.databaseFilePath ?? 'monitoring.db'
        );

        eventBus.subscribe(EventBusTopic.DISCORD_GUILD_CONNECT, guildId => {
            const manager = new MonitoringManager(eventBus, guildId, database);
            this.managers.push(manager);
            manager.start();
        });
    }
}

export = Monitoring;
