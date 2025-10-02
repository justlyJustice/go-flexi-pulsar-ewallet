import { useEffect } from "react";
import { toast } from "react-hot-toast";

import { useAuthStore } from "../stores/authStore";

import { getUserTransactions } from "../services/transactions";

const useTransactions = () => {
  const { user, updateUser } = useAuthStore();

  const handleGetUserTransactions = async () => {
    try {
      const res = await getUserTransactions(user?.id!);

      if (res.ok) {
        updateUser({ transactions: res.data?.transactions! });
      } else {
        return toast.error("Could not get user transaction");
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong!");
    }
  };

  useEffect(() => {
    handleGetUserTransactions();
  }, []);
};

export default useTransactions;
