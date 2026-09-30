import client from "./client";

import { Document } from "../pages/MerchantVerification";

// Map frontend document IDs to backend field names
const FIELD_MAP: Record<string, string> = {
  "grant-acceptance": "signedGrantAcceptanceForm",
  "grant-agreement": "signedGrantAgreement",
  "beneficiary-declaration": "signedBeneficiaryDeclaration",
  "code-of-conduct": "signedCodeOfConductAgreement",
  "anti-fraud": "signedAntiFraudDeclaration",
  "conflict-of-interest": "signedConflictOfInterestDeclaration",
  "business-registration": "businessRegistrationDocuments",
};

export const uploadDWCApplication = (documents: Document[]) => {
  const formData = new FormData();

  documents.forEach((doc) => {
    if (doc.file) {
      const fieldName = FIELD_MAP[doc.id];

      if (fieldName) {
        formData.append(fieldName, doc.file);
      }
    }
  });

  return client.post<{ data: any; message: string; errror: string }>(
    "/applications",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );
};
