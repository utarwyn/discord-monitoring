import { MonitoringManager } from '@monitor/managers/manager';

/**
 * @author Utarwyn
 * @since 1.0.0
 */
export abstract class Service<T extends ServiceOptions> {
    protected readonly manager: MonitoringManager;

    protected readonly id: number;

    protected readonly options: T;

    public constructor(manager: MonitoringManager, id: number, options: T) {
        this.manager = manager;
        this.id = id;
        this.options = options;
    }

    public abstract start(): void;

    public abstract execute(): void;
}

export interface ServiceOptions {
    endpoint: string;
}
