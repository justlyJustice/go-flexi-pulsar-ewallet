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

interface ElectricyBill extends DefaultBill {
  meter_type: string;
  meter_number: string;
}

interface CableBill extends DefaultBill {
  customer_id: string;
  variation_code: string;
  service_id: string;
}

export const purchaseAirtme = ({ amount, phone, service_name }: AirtimeData) =>
  client.post<{ data: any; error?: string | any }>("/airtime/purchase", {
    amount,
    phone,
    service_name,
  });

export const subscribeCable = (data: CableBill) =>
  client.post<{ data: any; error?: any }>("/cable-subscription", data);

export const purchaseData = ({
  amount,
  phone,
  service_id,
  variation_code,
  service_name,
}: DataBill) =>
  client.post<{ data: any; error?: string | any }>("/data/purchase", {
    amount,
    phone,
    service_id,
    variation_code,
    service_name,
  });

export const payElectricityBill = (data: ElectricyBill) =>
  client.post<{ data: any; error?: string | any }>("/electricity", data);
