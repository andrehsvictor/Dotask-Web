import { GetProjectDto } from './get-project-dto';

export interface PageGetProjectDto {
    content: GetProjectDto[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
    first: boolean;
    last: boolean;
    empty: boolean;
}