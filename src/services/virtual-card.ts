import client from "./client";

import { getUser } from "../stores/authStore";

const user = getUser();

const mode = "sandbox";

const ROUTE = "/virtual-card";

type CardDetails = {
  name_on_card: string;
  card_type: string;
  amount: string;
  customerEmail: string;
};

type FundCardDetails = {
  amount: string;
};

export const createVirtualCard = (
  type: string,
  { amount, card_type, customerEmail, name_on_card }: CardDetails
) => {
  return type === "usd"
    ? client.post<{ data: any; success: boolean; error: string }>(
        `${ROUTE}/create-usd`,
        {
          amount,
          card_type,
          customerEmail,
          name_on_card,
          // mode,
        }
      )
    : client.post<{ data: any; success: boolean; error: string }>("/");
};

export const getVirtualCardDetails = () =>
  client.post<{ data: { success: boolean; response: any }; error: string }>(
    `${ROUTE}/card-details`,
    { card_id: user?.vusd_card, mode }
  );

export const fundVirtualCard = (
  cardType: string,
  { amount }: FundCardDetails
) =>
  client.post(
    `/virtual-card/${cardType === "usd" ? "fund-usd" : "fund-naira"}`,
    {
      amount,
      card_id: user?.vusd_card,
      mode,
    }
  );

export const getExchangeRates = () =>
  client.get<{ success: boolean; data: { rate: string } }>(
    "/virtual-card/exchange-rate"
  );

type Customer = {
  houseNumber: string;
  firstName: string;
  lastName: string;
  idNumber: string;
  // customerEmail: string;
  phoneNumber: string;
  dateOfBirth: string;
  idImage: File | null;
  userPhoto: File | null;
  line1: string;
  state: string;
  zipCode: string;
  city: string;
  country: string;
  idType: string;
};

function formatDate(dateString: string) {
  if (dateString) {
    // Split the date string by the '/' delimiter
    const parts = dateString.split("-");

    // Reorder the parts to YYYY, MM, DD
    const year = parts[0];
    const month = parts[1];
    const day = parts[2];

    console.log(parts);

    // Join the parts with '-' to form the new format
    return `${month}/${day}/${year}`;
    // return `${year}-${month}-${day}`;
  }
}

export const createCardCustomer = (
  data: Customer,
  { idImage, userPhoto }: { idImage: string; userPhoto: string }
) => {
  const {
    houseNumber,
    dateOfBirth,
    idNumber,
    firstName,
    idType,
    lastName,
    line1,
    state,
    zipCode,
    city,
    country,
  } = data;

  return client.post<{
    data: any;
    message: string;
    error: string;
    success: boolean;
  }>(
    `${ROUTE}/create-card-customer?firstName=${firstName}&lastName=${lastName}&userPhoto=${userPhoto}&idImage=${idImage}&country=${country}&zipCode=${zipCode}&line1=${line1}&state=${state}&city=${city}&dateOfBirth=${formatDate(
      dateOfBirth
    )}&houseNumber=${houseNumber}&idNumber=${idNumber}&idType=${idType}`
  );
};

export const uploadCustomerDocuments = (data: Customer) => {
  const formData = new FormData();

  formData.append("idCard", data.idImage!);
  formData.append("image", data.userPhoto!);
  formData.append("idCardType", data.idType);
  formData.append("idNumber", data.idNumber);

  return client.post<{
    data: any;
    success: boolean;
    message: string;
    error: string;
  }>(`${ROUTE}/upload-customer-images`, formData, {
    headers: {
      "Content-Type": "application/",
    },
  });
};
