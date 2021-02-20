export enum EventBusTopic {
    BOT_CONNECTED,
    INCIDENT_UPDATE
}

type EventBusSubscription = (...args: any[]) => void;

export class EventBus {
    private subscriptions: Map<EventBusTopic, EventBusSubscription[]>;

    constructor() {
        this.subscriptions = new Map();
    }

    public publish(topic: EventBusTopic, ...args: any[]): void {
        this.subscriptions.get(topic)?.forEach(sub => sub(...args));
    }

    public subscribe(topic: EventBusTopic, subscription: EventBusSubscription): void {
        const subscriptions = this.subscriptions.get(topic) ?? [];
        subscriptions.push(subscription);
        this.subscriptions.set(topic, subscriptions);
    }
}