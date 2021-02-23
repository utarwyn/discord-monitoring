import { Message } from 'discord.js';
import { MonitoringManager } from '@monitor/managers/manager';
import { ManagerFactory } from '@monitor/managers/manager-factory';

export abstract class Command {
    public abstract name: string;

    public abstract admin = false;

    private readonly managers: ManagerFactory;

    public constructor(managers: ManagerFactory) {
        this.managers = managers;
    }

    public getManager(message: Message): MonitoringManager | undefined {
        return message.guild?.id ? this.managers.get(message.guild.id) : undefined;
    }

    public abstract run(message: Message, params: string[]): void;
}
