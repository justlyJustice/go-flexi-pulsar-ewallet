const env = import.meta.env;

export const apiUrl =
  env.MODE === "development" ? env.VITE_DEV_API_URL : env.VITE_PROD_API_URL;
