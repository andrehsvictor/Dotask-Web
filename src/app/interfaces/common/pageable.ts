export interface Pageable<T = any> {
    content?: T[];
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
