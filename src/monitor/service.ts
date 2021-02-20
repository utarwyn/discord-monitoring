import { MonitoringManager } from '@monitor/manager';

/**
 * @author Utarwyn
 * @since 1.0.0
 */
export abstract class Service {
    protected readonly manager: MonitoringManager;

    constructor(manager: MonitoringManager) {
        this.manager = manager;
    }

    public abstract start(): void;

    public abstract execute(): void;
}
