import { create } from "apisauce";

import { getToken } from "../stores/authStore";

const apiClient = create({ baseURL: "https://go-flexi-be.onrender.com" });

// const authStore = useAuthStore();

apiClient.addAsyncRequestTransform(async (req) => {
  const token = getToken();

  if (token) {
    req.headers = req.headers || {};
    req.headers.Authorization = `Bearer ${token}`;
  }
});

export default apiClient;
