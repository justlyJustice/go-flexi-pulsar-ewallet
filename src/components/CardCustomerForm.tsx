import React, { useRef, useState } from "react";
import { FileText, Trash2, UploadCloud, User } from "lucide-react";
import { toast } from "react-hot-toast";
import {
  createCardCustomer,
  uploadCustomerDocuments,
} from "../services/virtual-card";
import { useAuthStore } from "../stores/authStore";

interface FormData {
  houseNumber: string;
  firstName: string;
  lastName: string;
  idNumber: string;
  // customerEmail: string;
  phoneNumber: string;
  dateOfBirth: string;
  idImage: File | null;
  userPhoto: File | null;
  line1: string;
  state: string;
  zipCode: string;
  city: string;
  country: string;
  idType: string;
}

const CardCustomerForm = ({
  setActiveTab,
}: {
  setActiveTab: React.Dispatch<
    React.SetStateAction<"create-customer" | "virtual-card">
  >;
}) => {
  const { user: mainUser, updateUser } = useAuthStore();
  const [step, setStep] = useState(mainUser?.profileImage ? 2 : 1);
  const [isLoading, setIsLoading] = useState(false);
  const [previews, setPreviews] = useState<{
    idImagePreview: string | null;
    userPhotoPreview: string | null;
  }>({
    idImagePreview: null,
    userPhotoPreview: null,
  });
  const userPhotoInputRef = useRef<HTMLInputElement>(null);
  const IDImageInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    houseNumber: "",
    idNumber: "",
    phoneNumber: "",
    dateOfBirth: "",
    idImage: null,
    userPhoto: null,
    line1: "",
    state: "",
    zipCode: "",
    city: "",
    country: "Nigeria",
    idType: "",
  });

  // Uploaded files
  const [uploadedDocument, setUploadedDocument] = useState("");
  const [uploadedPhoto, setUploadedPhoto] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (step === 1) {
      try {
        setIsLoading(true);
        const res = await uploadCustomerDocuments(formData);
        setIsLoading(false);

        if (!res.ok) {
          console.log(res.data);
          return toast.error(res.data?.error!);
        }

        if (res.ok) {
          toast.success(res.data?.message!);
          const user = res.data?.data;

          updateUser({
            idCard: user.idCard,
            idCardType: user.idCardType,
            idNumber: user.idNumber,
            profileImage: user.profileImage,
          });

          setUploadedDocument(user.idCard);
          setUploadedPhoto(user.profileImage);
          setStep(2);
        }
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    } else {
      try {
        setIsLoading(true);
        const res = await createCardCustomer(formData, {
          userPhoto: uploadedPhoto,
          idImage: uploadedDocument,
        });
        setIsLoading(false);

        if (!res.ok) {
          return toast.error(res.data?.error!);
        }

        if (res.ok) {
          setActiveTab("virtual-card");
          toast.success(res.data?.message!);
        }
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;

    if (type === "file") {
      const file = (e.target as HTMLInputElement).files?.[0] || null;

      if (!file) return;

      // Validate file type (PDF or image)
      const validTypes = ["image/jpeg", "image/png", "image/jpg"];

      if (!validTypes.includes(file.type)) {
        toast.error("Please upload a PDF, JPEG, or PNG file");
        return;
      }

      // Validate file size (max 500MB)
      if (file.size > 500 * 1024 * 1024) {
        toast.error("File size must be less than 500MB");
        return;
      }

      const key = `${name}Preview`;
      setFormData((prev) => ({ ...prev, [name]: file }));

      // Create preview for images
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();

        reader.onload = () => {
          setPreviews((prev) => ({
            ...prev,
            [key]: reader.result,
          }));
        };
        reader.readAsDataURL(file);
      } else {
        setPreviews((prev) => ({ ...prev, [name]: null }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleRemoveFile = (name: string) => {
    setPreviews((prev) => ({ ...prev, [name]: null }));
    setFormData((prev) => ({ ...prev, [name]: null }));

    if (userPhotoInputRef.current) {
      userPhotoInputRef.current.value = "";
    }

    if (IDImageInputRef.current) {
      IDImageInputRef.current.value = "";
    }
  };

  const { idImagePreview, userPhotoPreview } = previews;
  const { idImage, userPhoto } = formData;

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-3">
        {step === 1 && (
          <>
            <div className="flex flex-col items-center justify-center space-y-1">
              <label className="flex justify-center items-center cursor-pointer self-center p-1 border border-gray-300 rounded-full h-24 w-24 hover:bg-gray-100 overflow-hidden">
                {userPhoto && userPhoto.type.startsWith("image/") ? (
                  <img
                    alt="userPhoto"
                    src={userPhotoPreview!}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="h-4 w-4 text-gray-400" />
                )}

                <input
                  ref={userPhotoInputRef}
                  id="userPhoto"
                  name="userPhoto"
                  type="file"
                  accept=".jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  className="hidden"
                  required
                />
              </label>

              <span className="font-normal text-gray-400 text-xs">
                {userPhoto ? userPhoto.name : "Select User Photo"}
              </span>
            </div>

            <div className="flex border-b border-gray-200"></div>

            <div className="grid grid-cols-2 gap-1">
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ID Type <span className="text-red-500">*</span>
                </label>

                <select
                  id="idType"
                  name="idType"
                  required
                  value={formData.idType}
                  onChange={handleInputChange}
                  className="input"
                >
                  <option value="">Select ID Type</option>
                  <option value="BVN">BVN</option>
                  <option value="NIN">NIN</option>
                  <option value="PASSPORT">Passport</option>
                  <option value="DRIVERS_LICENSE">Driver's License</option>
                </select>
              </div>

              <div className="relative">
                <label
                  htmlFor="idNumber"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  ID Number <span className="text-red-500">*</span>
                </label>

                <input
                  type="text"
                  id="idNumber"
                  name="idNumber"
                  placeholder="1234567890"
                  required
                  value={formData.idNumber}
                  onChange={handleInputChange}
                  className="input"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ID Photo <span className="text-red-500">*</span>
                <span className="text-xs text-gray-500 ml-1">
                  (JPEG, JPG or PNG, max 500MB)
                </span>
              </label>

              {idImage ? (
                <div className="border border-gray-200 rounded-lg p-3 relative">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {idImage?.type.startsWith("image/") ? (
                        <img
                          src={idImagePreview!}
                          alt="Certificate preview"
                          className="h-16 w-16 object-contain mr-3"
                        />
                      ) : (
                        <FileText className="h-16 w-16 text-gray-400 mr-3" />
                      )}

                      <div>
                        <p className="text-sm font-medium text-gray-900 truncate max-w-64">
                          {idImage?.name}
                        </p>

                        <p className="text-xs text-gray-500">
                          {Math.ceil((idImage?.size || 0) / 1024)} KB
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveFile("idImage")}
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
                      ref={IDImageInputRef}
                      name="idImage"
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
          </>
        )}

        {step === 2 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  First Name <span className="text-red-500">*</span>
                </label>

                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  required
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="input"
                />
              </div>

              <div>
                <label
                  htmlFor="lastName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Last Name <span className="text-red-500">*</span>
                </label>

                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  required
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="input"
                />
              </div>

              {/* <div>
                <label
                  htmlFor="customerEmail"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="customerEmail"
                  name="customerEmail"
                  required
                  value={formData.customerEmail}
                  onChange={handleInputChange}
                  className="input"
                />
              </div> */}

              {/* <div>
                <label
                  htmlFor="phoneNumber"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Phone Number
                </label>

                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  required
                  placeholder="e.g., 1234567890"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  className="input"
                />
              </div> */}
            </div>

            <div>
              <label
                htmlFor="line1"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Street Address <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="line1"
                name="line1"
                required
                value={formData.line1}
                onChange={handleInputChange}
                className="input"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
              <div>
                <label
                  htmlFor="houseNumber"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  House Number <span className="text-red-500">*</span>
                </label>

                <input
                  type="text"
                  id="houseNumber"
                  name="houseNumber"
                  required
                  value={formData.houseNumber}
                  onChange={handleInputChange}
                  className="input"
                />
              </div>

              <div>
                <label
                  htmlFor="dateOfBirth"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Date of Birth (mm/dd/yyyy){" "}
                  <span className="text-red-500">*</span>
                </label>

                <input
                  id="dateOfBirth"
                  name="dateOfBirth"
                  required
                  placeholder="mm/dd/yyyy"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  className="input"
                />
              </div>

              <div>
                <label
                  htmlFor="city"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  required
                  value={formData.city}
                  onChange={handleInputChange}
                  className="input"
                />
              </div>

              <div>
                <label
                  htmlFor="state"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  State <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  required
                  value={formData.state}
                  onChange={handleInputChange}
                  className="input"
                />
              </div>

              <div>
                <label
                  htmlFor="zipCode"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  ZIP Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="zipCode"
                  name="zipCode"
                  required
                  value={formData.zipCode}
                  onChange={handleInputChange}
                  className="input"
                />
              </div>

              <div>
                <label
                  htmlFor="country"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Country <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="country"
                  name="country"
                  required
                  value={formData.country}
                  onChange={handleInputChange}
                  className="input"
                />
              </div>
            </div>
          </>
        )}

        {/* Submit Button */}
        <div className="">
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full flex items-center justify-center p-1 rounded-lg transition-colors font-medium ${
              isLoading
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-primary-600 hover:bg-primary-700 text-white"
            }`}
          >
            {isLoading ? "Loading" : step === 1 ? "Continue" : "Submit"}
            {/* {step === 1 && isLoading ? "Submitting" : "Continue"}
            {step === 2 && isLoading ? "Submitting" : "Submit"} */}
          </button>
        </div>
      </div>
    </form>
  );
};

export default CardCustomerForm;
