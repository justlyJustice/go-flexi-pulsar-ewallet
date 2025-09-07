import React from "react";
import { Modal } from "./Modal";
import { useNavigate } from "react-router-dom";

export const KycModal = ({
  setIsOpen,
  isOpen,
}: {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const navigate = useNavigate();

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="KYC Verification Required"
        description="This feature is pending until you complete your KYC verification. Please complete your profile verification to access transfers."
        actionText="Complete KYC"
        onAction={() => {
          setIsOpen(false);
          navigate("/profile");
        }}
      />
    </>
  );
};
