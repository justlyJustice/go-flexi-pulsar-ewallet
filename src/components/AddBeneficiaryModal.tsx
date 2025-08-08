import React, { useState, useEffect } from "react";
import { Dialog, Description, DialogTitle } from "@headlessui/react";
import { useBankStore } from "../stores/banksStore";
import { verifyAccountName } from "../services/transfer";
import { FileDigit, Landmark, User } from "lucide-react";
import toast from "react-hot-toast";

import { createBeneficiary } from "../services/beneficiaries";
import { useAuthStore } from "../stores/authStore";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
};

export const AddBeneficiaryModal = ({
  isOpen,
  onClose,
  title,
  description,
}: ModalProps) => {
  const [values, setValues] = useState({
    account_number: "",
    amount: "",
    bank_name: "",
    name_enquiry_reference: "",
    narration: "",
    bank_code: "",
    beneficiary_type: "",
  });
  const banks = useBankStore((state) => state.banks);
  const updateUser = useAuthStore((store) => store.updateUser);
  const [bankName, setBankName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleValidateAccount = async () => {
    setError("");
    setValues((prevValues) => ({
      ...prevValues,
      name_enquiry_reference: "",
    }));

    try {
      setLoading(true);
      const res = await verifyAccountName(
        values.bank_name,
        values.account_number
      );
      setLoading(false);

      if (!res.ok) {
        toast.error(res?.data!.error);
        setError(res.data?.error!);
      } else {
        const data = res?.data!.data.data;

        setValues((prevValues) => ({
          ...prevValues,
          name_enquiry_reference: data.account_name,
        }));
      }
    } catch (error: any) {
      console.log(error);
      toast.error(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!bankName || bankName === "") return;

    handleValidateAccount();
  }, [bankName]);

  useEffect(() => {
    if (values.account_number === "") {
      setBankName("");
      setValues((prev) => ({ ...prev, name_enquiry_reference: "" }));
    }
  }, [values.account_number]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setValues((prevValues) => ({ ...prevValues, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");

    try {
      setLoading(true);
      const res = await createBeneficiary({
        account_name: values.name_enquiry_reference,
        account_number: values.account_number,
        bank_code: values.bank_code,
        beneficiary_type: values.beneficiary_type,
        bank_name: values.bank_name,
      });
      setLoading(false);

      if (!res.ok) {
        setError(res.data?.error!);
        toast.error(res.data?.error!);

        setTimeout(() => {
          setError("");
        }, 5000);
      } else {
        const beneficiaries = res.data?.beneficiaries!;
        updateUser({ beneficiaries });

        toast.success("Add beneficiary successfullly");
        onClose();
      }
    } catch (error: any) {
      console.log(error);
      toast.error(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-2"
    >
      <div className="fixed inset-0 bg-black/90" aria-hidden="true" />

      <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-lg z-50">
        <DialogTitle className="text-xl font-bold text-gray-900">
          {title}
        </DialogTitle>

        <Description className="mb-1 text-gray-700">{description}</Description>

        {error && (
          <div className="mb-2 p-2 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form className="my-2" onSubmit={handleSubmit}>
          <div className="mb-1">
            <label
              htmlFor="account_number"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Account Number
            </label>

            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-1 flex items-center pointer-events-none">
                <FileDigit className="h-4 w-3 text-gray-400" />
              </div>

              <input
                type="text"
                id="account_number"
                name="account_number"
                className="input pl-10"
                placeholder="0123456789"
                value={values.account_number}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="mb-1">
            <label
              htmlFor="bank-select"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Bank Name
            </label>

            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-1 flex items-center pointer-events-none">
                <Landmark className="h-4 w-3 text-gray-400" />
              </div>

              <select
                disabled={values.account_number.length <= 5}
                className="input pl-4"
                name="bank-select"
                id="bank-select"
                value={bankName}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                  const { value } = e.target;
                  setBankName(value);

                  const selectedBank = banks.filter(
                    (bank) => bank.name === value
                  )[0];
                  setValues((prevValues) => ({
                    ...prevValues,
                    bank_name: selectedBank.name,
                    bank_code: selectedBank.code,
                  }));
                }}
              >
                <option value="">Select Bank</option>

                {banks.map((bank, i) => (
                  <option className="ml-2" key={i} value={bank.name}>
                    {bank.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-1">
            <label
              htmlFor="name_enquiry_reference"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Account Name
            </label>

            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-1 flex items-center pointer-events-none">
                <User className="h-4 w-3 text-gray-400" />
              </div>

              <input
                disabled
                type="text"
                id="name_enquiry_reference"
                name="name_enquiry_reference"
                className="input pl-10"
                value={values.name_enquiry_reference}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="mb-1">
            <label
              htmlFor="bank-select"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Beneficiary Type
            </label>

            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-1 flex items-center pointer-events-none">
                <Landmark className="h-4 w-3 text-gray-400" />
              </div>

              <select
                className="input pl-4"
                name="beneficiary_type"
                id="beneficiary-select"
                value={values.beneficiary_type}
                onChange={handleChange}
              >
                <option value="">Select Beneficiary Type</option>

                <option value="individual">Individual</option>
                <option value="business">Business</option>
                <option value="merchant">Merchant</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-3">
            <button
              onClick={() => {
                onClose();

                setValues({
                  account_number: "",
                  amount: "",
                  bank_name: "",
                  name_enquiry_reference: "",
                  narration: "",
                  bank_code: "",
                  beneficiary_type: "",
                });
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              type="button"
            >
              Close
            </button>

            <button
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              type="submit"
            >
              {loading ? "Validating" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </Dialog>
  );
};
