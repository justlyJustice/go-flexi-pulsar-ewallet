type CooperativeType =
  | "business"
  | "smedan"
  | "cooperative-owner"
  | "cooperative-member"
  | "solo-cooperative";

type PersonalDetails = {
  name: string;
  profileNumber: string;
  verificationCode: string;
  memberNumber: string;
};

export interface CorporateFormData {
  number: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  phoneNumber: string;
  cooperativeType: CooperativeType;
  trx: string;
  email: string;
  rcNumber: string;
  companyType: "RC" | "BN";
  entityType: "RC" | "BN";
  companyName: string;
  city: string;
  occupation: string;
  gender: "MALE" | "FEMALE";
  account_number: string;
  bank_name: string;
  business_name: string;
  name_enquiry_reference: string;
  cooperativeName: string;
  profileNumber: string;
  verificationCode: string;
  memberNumber: string;
  certificateNumber: string;

  // New Properties

  directorDetails: PersonalDetails;
  secretaryDetails: PersonalDetails;
  treasurerDetails: PersonalDetails;
}
