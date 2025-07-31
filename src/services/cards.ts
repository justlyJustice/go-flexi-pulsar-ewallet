import client from "./client";

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
    ? client.post("/virtual-card/create-usd", {
        amount,
        card_type,
        customerEmail,
        name_on_card,
        mode: "sandbox",
      })
    : client.post("/");
};
