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
      `/kyc/verify-bvn?number=${number}&firstName=${firstName.toUpperCase()}&lastName=${lastName.toUpperCase()}&phoneNumber=${phoneNumber}&dateOfBirth=${reversedDate}&mode=sandbox`
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

export const confirmKYC = (type: string, data: any) => {
  if (type === "bvn") {
    const { trx, otp } = data;

    return client.post<{ error?: string; user: any; success: boolean }>(
      `/kyc/confirm-bvn?trx=${trx}&otp=${otp}&mode=sandbox`
    );
  } else {
    const { number, firstName, lastName, dateOfBirth, phoneNumber } = data;

    return client.post<{ error?: string; user: any; success: boolean }>(
      "/kyc/confirm-nin",
      {
        number,
        firstName,
        lastName,
        dateOfBirth,
        phoneNumber,
      }
    );
  }
};
