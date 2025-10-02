import { create } from "apisauce";

import { getToken } from "../stores/authStore";
import { apiUrl } from "../utils/apiUrl";

const apiClient = create({
  baseURL: apiUrl,
});

apiClient.addAsyncRequestTransform(async (req) => {
  const token = getToken();

  if (token) {
    req.headers = req.headers || {};
    req.headers.Authorization = `Bearer ${token}`;
  }
});

export default apiClient;
