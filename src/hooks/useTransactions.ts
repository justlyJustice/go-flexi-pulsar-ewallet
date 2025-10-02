import { useEffect } from "react";
import { toast } from "react-hot-toast";

import { useAuthStore } from "../stores/authStore";

import { getUserTransactions } from "../services/transactions";
import { useTransactionStore } from "../stores/transactionStore";

const useTransactions = () => {
  const { setTransactions } = useTransactionStore();
  const { user } = useAuthStore();

  const handleGetUserTransactions = async () => {
    try {
      const res = await getUserTransactions(user?.id!);

      if (res.ok) {
        setTransactions(res.data?.transactions!);
      } else {
        return toast.error("Could not get user transaction");
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong!");
    }
  };

  useEffect(() => {
    if (user !== null) {
      handleGetUserTransactions();
    }
  }, [user]);
};

export default useTransactions;
