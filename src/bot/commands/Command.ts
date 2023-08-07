import { ApplicationCommandDataResolvable, ChatInputCommandInteraction } from 'discord.js';
import { MonitoringManager } from '@monitor/managers/manager';
import { ManagerFactory } from '@monitor/managers/manager-factory';

export abstract class Command {
    private readonly managers: ManagerFactory;

    public abstract data: ApplicationCommandDataResolvable;

    constructor(managers: ManagerFactory) {
        this.managers = managers;
    }

    public getManager(interaction: ChatInputCommandInteraction): MonitoringManager | undefined {
        return interaction.guild?.id ? this.managers.get(interaction.guild.id) : undefined;
    }

    public abstract execute(interaction: ChatInputCommandInteraction): Promise<void>;
}
