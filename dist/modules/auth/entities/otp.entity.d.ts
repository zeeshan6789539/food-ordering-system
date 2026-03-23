export declare class Otp {
    id: string;
    emailOrPhone: string;
    hashedOtp: string;
    createdAt: Date;
    isExpired(): boolean;
}
