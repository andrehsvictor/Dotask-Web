export interface GetUserDto {
    id: string;
    name: string;
    emailVerified: boolean;
    email: string;
    createdAt: Date;
    updatedAt: Date;
    taskCount: number;
    projectCount: number;
}
