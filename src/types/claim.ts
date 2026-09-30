import { UpgradeType } from "./user";

export type ClaimStatus =
  | "awaiting_submission"
  | "pending"
  | "approved"
  | "declined";

export type Claim = {
  _id: string;
  upgradeType: UpgradeType;
  user:
    | {
        _id: string;
        fullName: string;
        email: string;
        phoneNumber: string;
      }
    | string;
  claimNumber: string;
  details?: Record<string, any>;
  status: ClaimStatus;
  reviewedBy?: {
    _id: string;
    fullName: string;
    email: string;
  };
  reviewedAt?: string;
  declineReason?: string;
  createdAt: string;
  updatedAt: string;
};
