import client from "./client";

interface DefaultBill {
  amount: string;
  service_name?: string;
  phone: string;
}

interface AirtimeData extends DefaultBill {}

interface DataBill extends DefaultBill {
  service_id: string;
  variation_code: string;
}

export const purchaseAirtme = ({ amount, phone, service_name }: AirtimeData) =>
  client.post("/airtime", { amount, phone, service_name });

export const subscribeCable = () => client.post("/cable-subscription");

export const purchaseData = ({
  amount,
  phone,
  service_id,
  variation_code,
  service_name,
}: DataBill) =>
  client.post("/data", {
    amount,
    phone,
    service_id,
    variation_code,
    service_name,
  });
