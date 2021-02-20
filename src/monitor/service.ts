import { EventBus } from '@bot/event-bus';

/**
 * @author Utarwyn
 * @since 1.0.0
 */
export abstract class Service {
    protected readonly eventBus: EventBus;

    constructor(eventBus: EventBus) {
        this.eventBus = eventBus;
    }

    public abstract start(): void;

    public abstract execute(): void;
}
