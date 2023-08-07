import { Client, GatewayIntentBits } from 'discord.js';
import { MonitoringBot } from '@bot/index';
import { Config } from '@config/Config';
import localize from '@i18n/localize';
import { MonitoringDatabase } from '@database/index';
import { ManagerFactory } from '@monitor/managers/manager-factory';

/**
 * Controls all interactions of the bot.
 *
 * @author Utarwyn
 * @since 1.0.0
 */
class Monitoring {
    private readonly configuration: Config;

    private readonly bot: MonitoringBot;

    constructor(configuration?: Config) {
        this.configuration = configuration ?? {};

        if (this.configuration.language) {
            localize.loadFromLocale(this.configuration.language);
        }

        const database = new MonitoringDatabase(
            this.configuration.databaseFilePath ?? 'monitoring.db'
        );
        this.bot = new MonitoringBot(new ManagerFactory(database));
    }

    public async login(token?: string): Promise<void> {
        const loginToken = token ?? this.configuration.token;

        if (!loginToken) {
            throw new Error('Bot token needed to start Discord client.');
        }

        const client = new Client({
            intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]
        });
        this.bot.attachToClient(client);
        await client.login(loginToken);
    }

    public attach(client: Client): void {
        this.bot.attachToClient(client);
    }
}

export = Monitoring;
