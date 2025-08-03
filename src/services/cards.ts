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

export const createVirtualCard = (
  type: string,
  { amount, card_type, customerEmail, name_on_card }: CardDetails
) => {
  return type === "usd"
    ? client.post(`${ROUTE}/create-usd`, {
        amount,
        card_type,
        customerEmail,
        name_on_card,
        mode,
      })
    : client.post("/");
};

export const getVirtualCardDetails = () =>
  client.post(`${ROUTE}/card-details`, { card_id: user?.vusd_card, mode });
