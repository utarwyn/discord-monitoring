import { Client } from 'discord.js';
import { EventBus } from '@bot/event-bus';
import { MonitoringBot } from '@bot/index';
import { Config } from '@config/Config';
import { MonitoringManager } from '@monitor/manager';
import localize from '@config/localize';

/**
 * Controls all interactions of the bot.
 *
 * @author Utarwyn
 * @since 1.0.0
 */
class Monitoring {
    private readonly configuration: Config;

    private readonly bot: MonitoringBot;

    constructor(configuration: Config) {
        this.configuration = configuration;

        if (configuration.language) {
            localize.setLanguage(configuration.language);
        }

        const eventBus = new EventBus();
        this.bot = new MonitoringBot(eventBus);
        new MonitoringManager(eventBus);
    }

    public async login(token?: string): Promise<void> {
        const loginToken = token ?? this.configuration.token;

        if (!loginToken) {
            throw new Error('Bot token needed to start Discord client.');
        }

        this.validateConfiguration();

        const client = new Client();
        this.bot.attachToClient(client, this.configuration.channelId!);
        await client.login(loginToken);
    }

    public attach(client: Client): void {
        this.validateConfiguration();
        this.bot.attachToClient(client, this.configuration.channelId!);
    }

    private validateConfiguration(): void {
        if (!this.configuration.channelId) {
            throw new Error('Channel identifier needed to start Discord client.');
        }
    }
}

export = Monitoring;
