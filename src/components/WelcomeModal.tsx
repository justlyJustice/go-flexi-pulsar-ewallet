import { useEffect, useState } from "react";
import { Dialog, Description, DialogTitle } from "@headlessui/react";

import { useAuthStore } from "../stores/authStore";

export const WelcomeModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const user = useAuthStore((store) => store.user);

  useEffect(() => {
    const isNewUser = localStorage.getItem("isNewUser");

    if (isNewUser) {
      setIsOpen(true);
      localStorage.removeItem("isNewUser");
    }
  }, []);

  return (
    <Dialog
      open={isOpen}
      onClose={() => setIsOpen(false)}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div className="fixed inset-0 bg-black/90" aria-hidden="true" />
      <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-lg">
        <DialogTitle className="text-2xl font-bold text-green-600 mb-3">
          Welcome, {user?.fullName}! 👋
        </DialogTitle>

        <Description className="mb-5">
          <p className="text-gray-700">
            Thank you for joining us! Get started by exploring your dashboard.
          </p>
          <ul className="mt-3 space-y-2 text-sm text-gray-600">
            <li>• Complete your profile to unlock all features</li>
            <li>• Verify your email for account security</li>
            <li>• Check out our getting started guide</li>
          </ul>
        </Description>

        <div className="flex justify-end">
          <button
            onClick={() => setIsOpen(false)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            Close and Continue!
          </button>
        </div>
      </div>
    </Dialog>
  );
};
