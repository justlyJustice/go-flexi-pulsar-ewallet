import { ChangeEvent, useEffect, useRef, useState } from "react";
import {
  CreditCard,
  FileText,
  // Landmark,
  Trash2,
  UploadCloud,
  // User,
} from "lucide-react";
import toast from "react-hot-toast";
import { useBankStore } from "../../stores/banksStore";

import { verifyAccountName } from "../../services/transfer";

interface CorporateFormData {
  number: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  phoneNumber: string;
  // verificationCode: string;
  trx: string;
  email: string;
  rcNumber: string;
  companyType: "RC" | "BN";
  entityType: "RC" | "BN";
  companyName: string;
  city: string;
  occupation: string;
  gender: "MALE" | "FEMALE";
  account_number: string;
  bank_name: string;
  image: string;
  business_name: string;
  name_enquiry_reference: string;
  isMember: boolean;
  corporativeName: string;
  profileNumber: string;
  verificationCode: string;
}

interface CorporateProps {
  formData: CorporateFormData;
  setFormData: React.Dispatch<React.SetStateAction<CorporateFormData>>;
  certificateFile: File | null;
  setCertificateFile: React.Dispatch<React.SetStateAction<File | null>>;
}

const CorporateKYCForm = ({
  formData,
  setFormData,
  certificateFile,
  setCertificateFile,
}: CorporateProps) => {
  const banks = useBankStore((state) => state.banks);
  const [bankName, setBankName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [certificatePreview, setCertificatePreview] = useState<string | null>(
    null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type (PDF or image)
    const validTypes = ["application/pdf", "image/jpeg", "image/png"];
    if (!validTypes.includes(file.type)) {
      toast.error("Please upload a PDF, JPEG, or PNG file");
      return;
    }

    // Validate file size (max 500MB)
    if (file.size > 500 * 1024 * 1024) {
      toast.error("File size must be less than 500MB");
      return;
    }

    setCertificateFile(file);

    // Create preview for images
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => {
        setCertificatePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setCertificatePreview(null);
    }
  };

  const handleValidateAccount = async () => {
    setError("");
    setFormData((prevValues) => ({
      ...prevValues,
      name_enquiry_reference: "",
    }));

    try {
      setLoading(true);
      const res = await verifyAccountName(
        formData.bank_name,
        formData.account_number
      );
      setLoading(false);

      if (!res && res === null) {
        toast.error("Something went wrong");
        setError("Something went wrong");

        return setTimeout(() => {
          setError("");
        }, 5000);
      }

      if (!res.ok) {
        // const error = res.data?.error;

        toast.error(res?.data!.error);
        setError(res?.data!.error);

        return setTimeout(() => {
          setError("");
        }, 5000);
      } else {
        const data = res?.data!.data.data;

        setFormData((prevValues) => ({
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
    if (formData.account_number === "") {
      setBankName("");
      setFormData((prev) => ({ ...prev, name_enquiry_reference: "" }));
    }
  }, [formData.account_number]);

  function handleInputChange(
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ): void {
    const { name, value } = event.target;

    setFormData((prevData: CorporateFormData) => ({
      ...prevData,
      [name]: value,
    }));
  }

  const handleRemoveFile = () => {
    setCertificateFile(null);
    setCertificatePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      {error && (
        <div className="mb-1 p-2 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {!formData.isMember && (
        <>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Number
              </label>

              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                  <CreditCard size={16} className="text-gray-400" />
                </div>

                <input
                  type="text"
                  name="account_number"
                  value={formData.account_number}
                  onChange={handleInputChange}
                  className="input pl-10"
                  placeholder="Account Number"
                  required
                />
              </div>
            </div>

            <div className="relative rounded-md shadow-sm">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bank Name
              </label>

              {/* <div className="absolute inset-y-0 left-0 pl-1 flex items-center pointer-events-none">
            <Landmark size={16} className="text-gray-400" />
          </div> */}

              <select
                disabled={formData.account_number.length <= 5}
                className="input"
                name="bank_name"
                id="bank-select"
                value={bankName}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                  const { value } = e.target;
                  setBankName(value);

                  const selectedBank = banks.filter(
                    (bank) => bank.name === value
                  )[0];

                  setFormData((prevValues) => ({
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

          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Account Name
            </label>

            {/* <div className="absolute inset-y-0 left-0 top-1 pl-1 flex items-center pointer-events-none">
          <User className="h-4 w-3 text-gray-400" />
        </div> */}

            <input
              disabled
              type="text"
              name="account_name"
              value={
                loading ? "Validating..." : formData.name_enquiry_reference
              }
              onChange={handleInputChange}
              className="input"
              placeholder="Account Name"
              required
            />
          </div>
        </>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Business Name
        </label>

        <input
          type="text"
          name="business_name"
          value={formData.business_name}
          onChange={handleInputChange}
          className="input"
          placeholder="Business Name"
          required
        />
      </div>

      {!formData.isMember && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            CAC Certificate
            <span className="text-xs text-gray-500 ml-1">
              (JPEG, or PNG, max 500MB)
            </span>
          </label>

          {certificatePreview ? (
            <div className="border border-gray-200 rounded-lg p-3 relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {certificateFile?.type.startsWith("image/") ? (
                    <img
                      src={certificatePreview}
                      alt="Certificate preview"
                      className="h-16 w-16 object-contain mr-3"
                    />
                  ) : (
                    <FileText className="h-16 w-16 text-gray-400 mr-3" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-900 truncate max-w-64">
                      {certificateFile?.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {Math.ceil((certificateFile?.size || 0) / 1024)} KB
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <UploadCloud className="w-8 h-8 mb-1 text-gray-400" />

                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">
                      Click to select and upload file
                    </span>
                  </p>
                  <p className="text-xs text-gray-500">
                    JPG, or PNG (MAX. 500MB)
                  </p>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  className="hidden"
                  required
                />
              </label>
            </div>
          )}
        </div>
      )}

      <div className="space-y-2">
        <div className="flex gap-1">
          <input
            type="checkbox"
            className="checkbox"
            onChange={(e) => {
              const checked = e.target.checked;

              setFormData((prev) => ({ ...prev, isMember: checked }));
            }}
          />
          <span className="text-gray-500 text-sm">
            Are you a Corporative Member?
          </span>
        </div>

        {formData.isMember && (
          <>
            <div className="flex border-b border-gray-200 mb-6"></div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Corporative Name
              </label>

              {/* <div className="absolute inset-y-0 left-0 top-1 pl-1 flex items-center pointer-events-none">
          <User className="h-4 w-3 text-gray-400" />
        </div> */}

              <input
                type="text"
                name="corporativeName"
                value={formData.corporativeName}
                onChange={handleInputChange}
                className="input"
                placeholder="Corporate Name"
                required={formData.isMember}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Verification Code
                </label>

                <input
                  type="text"
                  name="verificationCode"
                  value={formData.verificationCode}
                  onChange={handleInputChange}
                  className="input"
                  placeholder="Verification Code"
                  required={formData.isMember}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Profile Number
                </label>

                <input
                  type="text"
                  name="profileNumber"
                  value={formData.profileNumber}
                  onChange={handleInputChange}
                  className="input"
                  placeholder="Profile Number"
                  required={formData.isMember}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CorporateKYCForm;
