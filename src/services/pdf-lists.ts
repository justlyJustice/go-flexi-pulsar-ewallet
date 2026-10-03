import client from "./client";

type UpgradeType = "SMEDAN_CAC" | "BUSINESS_COOPERATIVE";

export const getPDFList = (type: UpgradeType) =>
  client.get(
    `/applications/approved-list?upgradeType=${type}`,
    {},
    {
      responseType: "blob",
    },
  );
