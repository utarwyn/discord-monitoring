export enum CachetIncidentStatusEnum {
    SCHEDULED = 0,
    INVESTIGATING = 1,
    IDENTIFIED = 2,
    WATCHING = 3,
    FIXED = 4
}

export class CachetIncident {
    public readonly id: number;
    public readonly componentId: number;
    public readonly name: string;
    public readonly message: string;
    public readonly status: CachetIncidentStatusEnum;
    public readonly humanStatus: string;
    public readonly createdAt: Date;
    public readonly updatedAt: Date;
    public readonly scheduledAt: Date;

    constructor(input: any) {
        this.id = input.id;
        this.componentId = input.component_id;
        this.name = input.name;
        this.message = input.message;
        this.status = input.status;
        this.humanStatus = input.human_status;
        this.createdAt = new Date(input.created_at);
        this.updatedAt = new Date(input.updated_at);
        this.scheduledAt = new Date(input.scheduled_at);
    }

    public get state(): string {
        return JSON.stringify({
            name: this.name,
            message: this.message,
            status: this.status
        });
    }
}
