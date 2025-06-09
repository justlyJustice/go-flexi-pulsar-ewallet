import { useEffect } from "react";
import { toast } from "react-hot-toast";

import { useAuthStore } from "../stores/authStore";
import { useTransactionStore } from "../stores/transactionStore";
import { getUpdatedUserBalance } from "../services/add-funds";

const POLLING_INTERVAL = 120000; // 60 seconds

export const useBalancePolling = (userId: string | undefined) => {
  const { user, updateBalance } = useAuthStore();
  const addTransaction = useTransactionStore((state) => state.addTransaction);

  useEffect(() => {
    if (!userId) return;

    let isMounted = true;
    let timeoutId: NodeJS.Timeout;

    const pollBalance = async () => {
      try {
        const res = await getUpdatedUserBalance(userId);

        if (isMounted && res.ok) {
          const newBalance = res.data?.user.accountBalance;
          const oldBalance = user?.balance || 0;

          // Update balance if it changed
          // if (newBalance !== oldBalance) {
          //   updateBalance(newBalance);

          // Add transaction if balance increased
          if (newBalance > oldBalance) {
            updateBalance(newBalance);
            const amount = newBalance - oldBalance;

            addTransaction({
              amount,
              type: "deposit",
              description: "Received - Balance Topup",
              status: "completed",
            });
            toast.success("Top up received");
          }
          // }
        }
      } catch (error) {
        console.error("Balance polling error:", error);
      } finally {
        if (isMounted) {
          timeoutId = setTimeout(pollBalance, POLLING_INTERVAL);
        }
      }
    };

    // Start polling
    pollBalance();

    // Cleanup
    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [userId, user?.balance, updateBalance, addTransaction]);
};
