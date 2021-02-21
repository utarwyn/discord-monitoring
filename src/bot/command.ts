import { Message } from 'discord.js';
import { EventBus } from '@bot/event-bus';

export abstract class Command {
    public readonly name: string;

    protected readonly eventBus: EventBus;

    constructor(eventBus: EventBus, name: string) {
        this.eventBus = eventBus;
        this.name = name;
    }

    public abstract run(message: Message, params: string[]): void;
}
