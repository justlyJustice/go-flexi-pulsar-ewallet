import client from "./client";
import { CorporateKyc } from "./kyc";

export const addCorporative = (data: CorporateKyc) => {
  const formData = {
    accountNumber: data.account_number,
    bankName: data.bank_name,
    businessName: data.business_name,
    certificateNumber: data.certificateNumber,
    cooperativeName: data.cooperativeName,
    profileNumber: data.profileNumber,
    verificationCode: data.verificationCode,
    memberNumber: data.memberNumber,
    accountName: data.accountName,
    chairmanDetails: {
      name: data.chairmanName,
      profileNumber: data.profileNumber,
      verificationCode: data.verificationCode,
      memberNumber: data.memberNumber,
    },
    secretaryDetails: {
      name: data.secretaryName,
      profileNumber: data.profileNumber,
      verificationCode: data.verificationCode,
      memberNumber: data.memberNumber,
    },
    cooperativeType: data.cooperativeType,
  };

  return client.post("/corporate-businesses/", formData);
};
