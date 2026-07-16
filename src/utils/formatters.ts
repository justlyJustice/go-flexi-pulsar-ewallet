export const formatCurrency = (amount: number, currency?: string): string => {
  return new Intl.NumberFormat(currency === "USD" ? "en-US" : "en-NG", {
    style: "currency",
    currency: currency || "NGN",
    minimumFractionDigits: 2,
  }).format(amount);
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
};

export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

export const formatSubmitLabel = (label: string) => {
  switch (label) {
    case "business":
      return "Business";
    default:
      return "Cooperative";
  }
};
