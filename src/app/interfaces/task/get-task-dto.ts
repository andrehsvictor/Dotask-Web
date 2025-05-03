export interface GetTaskDto {
    id: string;
    title: string;
    description: string;
    status: 'IN_PROGRESS' | 'COMPLETED' | 'PENDING' | 'CANCELLED';
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
    dueDate: Date;
}
