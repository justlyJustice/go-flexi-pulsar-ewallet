import React from "react";
import { Modal } from "./Modal";

export const KycModal = ({
  setIsOpen,
  isOpen,
}: {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  // const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="KYC Verification Required"
        description="This feature is pending until you complete your KYC verification. Please complete your profile verification to access transfers."
        actionText="Complete KYC"
        // onAction={() => {
        //   setIsOpen(false);
        //   window.location.href = "/verify-kyc";
        // }}
      />
    </>
  );
};
