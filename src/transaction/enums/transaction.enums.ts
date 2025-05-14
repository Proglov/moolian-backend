
export enum Status {
    Requested = "Requested",
    Accepted = "Accepted",
    Sent = "Sent",
    Received = "Received",
    Canceled = "Canceled"
}

export enum NewStatusBySeller {
    Accepted = "Accepted",
    Sent = "Sent",
    Received = "Received"
}

export enum Volume {
    V30 = 30,
    V50 = 50,
    V100 = 100
}

export const volumeMultipliers: Record<number, number> = {
    30: 1,
    50: 1.4,
    100: 2.1,
};