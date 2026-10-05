export type Beneficiary = {
  beneficiaryType: "individual" | "business" | "merchant";
  bankName: string;
  accountNumber: string;
  accountName: string;
  _id: string;
};

type CorporateBiz = {
  _id: string;
  status: "verified" | "pending" | "declined";
  businessName: string;
  accountNumber: string;
  accountName: string;
  bankName: string;
};

export type UserTier = "individual" | "merchant" | "business";

export type KYCStatus = "pending" | "verified" | "unverified";

export type UpgradeType = "BUSINESS_COOPERATIVE" | "SMEDAN_CAC";

export interface User {
  id: string;
  idCardType?: string;
  email: string;
  currency: string;
  bankInformation: {
    accountNumber: string;
    accountName: string;
    bankName: string;
  };
  fullName: string;
  phoneNumber: string;
  joinDate: string;
  balance: number;
  idCard?: string;
  idNumber?: string;
  transactions: [];
  profileImage?: string;
  cacVerified: boolean;
  cacNumber?: string;
  ninNumber?: string;
  merchantVerificationCode?: string;
  corporateBiz: CorporateBiz;
  bvnVerified: boolean;
  ninVerified: boolean;
  isBlocked: boolean;
  isKYC: KYCStatus;
  vusd_card?: string;
  beneficiaries: Beneficiary[] | [];
  tier: UserTier;
  dailyTransferAmount: number;
  dailyTransferLimit: number;
  monthlyTransferAmount: number;
  monthlyTransferLimit: number;
  lastDailyReset?: Date;
  lastMonthlyReset?: Date;
  lastTransferTime?: Date;
  usdtBalance: number;
  upgradeType?: UpgradeType;
  applicationStatus?:
    | null
    | "not_submitted"
    | "pending"
    | "approved"
    | "rejected";
  rejectionReason?: string;
  usdAccountNumber?: string;
  isOnApprovedList?: boolean;
  usdAccountBalance?: number;
  approvedAt?: string;
  claimEnabled?: boolean;
}
