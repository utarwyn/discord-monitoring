import { MonitoringDatabase } from '@database/index';
import { MonitoringManager } from '@monitor/managers/manager';
import { ManagerClient } from '@monitor/managers/manager-client';

export class ManagerFactory {
    private readonly database: MonitoringDatabase;

    private managers: MonitoringManager[];

    constructor(database: MonitoringDatabase) {
        this.database = database;
        this.managers = [];
    }

    public get(guildId: string): MonitoringManager | undefined {
        return this.managers.find(manager => manager.guildId === guildId);
    }

    public async createManager(client: ManagerClient, guildId: string): Promise<void> {
        const manager = new MonitoringManager(client, guildId, this.database);
        this.managers.push(manager);
        await manager.start();
    }
}
