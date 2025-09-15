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
  client.post("/virtual-card/exchange-rate");
