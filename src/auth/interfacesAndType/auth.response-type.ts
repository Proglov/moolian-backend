import { ApiProperty } from "@nestjs/swagger"

export type TAuthResponse = {
    accessToken: string,
    refreshToken: string
}


const commonDoc = {
    type: String,
    example: 'eyJhbGciOiJIUzI21iIsInR5cCI6IkpXVCJ9.eyJ1c2VyS54iOiI2NzYyOTNkNTRmNWM0NzA0YzgyYzA3MzMiLCJpYXQiOjE3MzQ1Mjk1ODJ9.U-MMswPNvzDR1X9dHCD3UDH8EibWGe36uuZ7ZDKll6w'
}

const accessTokenDoc = {
    ...commonDoc,
    description: 'jwt access token'
}

const refreshTokenDoc = {
    ...commonDoc,
    description: 'jwt refresh token'
}

export class AuthResponse {
    @ApiProperty(accessTokenDoc)
    accessToken: string

    @ApiProperty(refreshTokenDoc)
    refreshToken: string
}