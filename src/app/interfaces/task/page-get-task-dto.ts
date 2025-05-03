import { GetTaskDto } from "./get-task-dto";

export interface PageGetTaskDto {
    content: GetTaskDto[];
    page: number;
    size: number;
    sort?: string[];
    totalElements?: number;
    totalPages?: number;
    first?: boolean;
    last?: boolean;
    numberOfElements?: number;
    empty?: boolean;
}
