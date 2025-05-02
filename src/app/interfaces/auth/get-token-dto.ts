export interface GetTokenDto {
    accessToken: string;
    refreshToken: string;
    tokenType: string;
    expiresIn: number;
}
