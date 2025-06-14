import { create } from "apisauce";

import { getToken } from "../stores/authStore";

const apiClient = create({
  baseURL:
    import.meta.env.MODE === "development"
      ? import.meta.env.VITE_DEV_API_URL
      : import.meta.env.VITE_PROD_API_URL,
});

// const authStore = useAuthStore();

apiClient.addAsyncRequestTransform(async (req) => {
  const token = getToken();

  if (token) {
    req.headers = req.headers || {};
    req.headers.Authorization = `Bearer ${token}`;
  }
});

export default apiClient;
