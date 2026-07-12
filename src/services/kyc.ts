import { CorporateFormData } from "../components/kyc/type";
import client from "./client";

function reverseDate(dateString: string) {
  if (dateString) {
    // Split the date string by the '/' delimiter
    const parts = dateString.split("-");

    // Reorder the parts to YYYY, MM, DD
    const year = parts[0];
    const month = parts[1];
    const day = parts[2];

    console.log(parts);

    // Join the parts with '-' to form the new format
    return `${day}-${month}-${year}`;
    // return `${year}-${month}-${day}`;
  }
}

export const verifyKYC = (type: string, data: any) => {
  if (type === "bvn") {
    const { number, firstName, lastName, dateOfBirth, phoneNumber } = data;

    const reversedDate = reverseDate(dateOfBirth);

    return client.post<{
      user?: any;
      data:
        | {
            message: string;
            otp: string;
            trx: string;
            success: boolean;
            warnings?: string;
          }
        | any;
      success: boolean;
      error?: string;
    }>(
      `/kyc/verify-bvn?number=${number}&firstName=${firstName.toUpperCase()}&lastName=${lastName.toUpperCase()}&phoneNumber=${phoneNumber}&dateOfBirth=${reversedDate}`
    );
  } else {
    const { number, firstName, lastName, dateOfBirth, phoneNumber } = data;

    const reversedDate = reverseDate(dateOfBirth);

    return client.post<{
      data: {
        message: string;
        otp: string;
        trx: string;
        success: boolean;
        warnings?: string;
        user?: any;
      };
      user?: any;
      success: boolean;
      error?: string;
    }>(
      `/kyc/verify-nin?number_nin=${number}&surname=${lastName}&firstname=${firstName}&birthdate=${reversedDate}&telephoneno=${phoneNumber}`
    );
  }
};

export const confirmKYC = (data: any) => {
  const { trx, verificationCode } = data;

  return client.post<{ error?: string; user: any; success: boolean }>(
    `/kyc/confirm-bvn?trx=${trx}&otp=${verificationCode}`
  );
};

interface CACData {
  rc_number: string;
  email: string;
  entity_type: string;
  company_type: string;
  company_name: string;
  surname: string;
  firstname: string;
  phoneNumber: string;
  gender: string;
  city: string;
  occupation: string;
}

export const verifyCAC = (data: CACData) => {
  const {
    city,
    company_name,
    company_type,
    email,
    entity_type,
    firstname,
    gender,
    occupation,
    phoneNumber,
    rc_number,
    surname,
  } = data;

  return client.post<{
    data: any;
    user?: any;
    success: boolean;
    error?: string;
  }>(
    `/kyc/verify-cac?rc_number=${rc_number}&company_name=${company_name}&company_type=${company_type}&entity_type=${entity_type}&email=${email}&firstname=${firstname}&surname=${surname}&gender=${gender}&occupation=${occupation}&city=${city}&phoneNumber=${phoneNumber}`
  );
};

interface CorporateKyc extends CorporateFormData {
  account_number: string;
  business_name: string;
  bank_name: string;
  verificationCode: string;
  profileNumber: string;
  accountName: string;
}

export const verifyCorporateKYC = (data: CorporateKyc) => {
  const formData = {
    account_number: data.account_number,
    bank_name: data.bank_name,
    business_name: data.business_name,
    certificateNumber: data.certificateNumber,
    cooperativeName: data.cooperativeName,
    profileNumber: data.profileNumber,
    verificationCode: data.verificationCode,
    memberNumber: data.memberNumber,
    accountName: data.accountName,
    chairmanDetails: {
      name: data.chairmanName,
      profileNumber: data.chairmanName ? data.profileNumber : "",
      verificationCode: data.chairmanName ? data.verificationCode : "",
      memberNumber: data.chairmanName ? data.memberNumber : "",
    },
    secretaryDetails: {
      name: data.secretaryName,
      profileNumber: data.secretaryName ? data.profileNumber : "",
      verificationCode: data.secretaryName ? data.verificationCode : "",
      memberNumber: data.secretaryName ? data.memberNumber : "",
    },
    cooperativeType: data.cooperativeType,
  };

  return client.post<{ error: string; data: any; user: any }>(
    "/kyc/verify-corporate-business",
    formData
  );
};
