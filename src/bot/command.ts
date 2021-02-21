import { Message } from 'discord.js';
import { EventBus } from '@bot/event-bus';

export abstract class Command {
    public readonly name: string;

    public readonly admin: boolean;

    protected readonly eventBus: EventBus;

    protected constructor(eventBus: EventBus, name: string, admin = false) {
        this.eventBus = eventBus;
        this.name = name;
        this.admin = admin;
    }

    public abstract run(message: Message, params: string[]): void;
}
