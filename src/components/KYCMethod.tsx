import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Shield,
  X,
  Smartphone,
  User,
  Calendar,
  Check,
  Briefcase,
  CreditCard,
  Mail,
} from "lucide-react";
import {
  // confirmKYC,
  verifyCAC,
  verifyCorporateKYC,
  verifyKYC,
} from "../services/kyc";
import { useAuthStore } from "../stores/authStore";
import toast from "react-hot-toast";
import CorporateKYCForm from "./kyc/Corporate";

interface KYCMethodProps {
  setMethod?: React.Dispatch<React.SetStateAction<"nin" | "cac" | null>>;
  method: "nin" | "cac" | null;
  onCancel: () => void;
  onComplete: () => void;
}

const KYCMethod: React.FC<KYCMethodProps> = ({
  method,
  onCancel,
  onComplete,
  // setMethod,
}) => {
  const { user, updateUser } = useAuthStore();
  const [step, setStep] = useState<number>(method === "cac" ? 2 : 1);
  const [formData, setFormData] = useState({
    number: "",
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    phoneNumber: "",
    verificationCode: "",
    trx: "",

    // CAC specific fields
    email: "",
    rcNumber: "",
    companyType: "RC" as "RC" | "BN",
    entityType: "RC" as "RC" | "BN",
    companyName: "",
    city: "",
    occupation: "",
    gender: "MALE" as "MALE" | "FEMALE",

    // Corporate specific fields
    account_number: "",
    bank_name: "",
    image: "",
    business_name: "",
    name_enquiry_reference: "",
  });
  const [certificateFile, setCertificateFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState<"cac" | "corporate">("cac");

  const [loading, setLoading] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const {
      dateOfBirth,
      firstName,
      lastName,
      number,
      phoneNumber,
      // trx,
      // verificationCode,
    } = formData;

    // if (method === "bvn") {
    //

    //   if (step === 1) {
    //     try {
    //       setLoading(true);
    //       const res = await verifyKYC("bvn", {
    //         dateOfBirth,
    //         firstName,
    //         lastName,
    //         number,
    //         phoneNumber,
    //       });

    //       const resData = res.data;

    //       if (res.ok) {
    //         const data = resData?.data;

    //         const confirmRes = await confirmKYC({
    //           trx: data?.trx,
    //         });

    //         setLoading(false);

    //         const confirmResData = confirmRes.data;

    //         if (confirmRes.ok) {
    //           // const user = resData?.user;

    //           // updateUser({
    //           //   balance: user.balance,
    //           //   bvnVerified: user.bvnVerified,
    //           //   isKYC: user.isKYC,
    //           // });
    //           toast.success("Verification Complete!");
    //           // onComplete();

    //           console.log(confirmResData);

    //           // setFormData((prev) => ({
    //           //   ...prev,
    //           //   trx: data?.trx,
    //           //   verificationCode: data?.otp!,
    //           // }));
    //           // toast.success(data?.message || "Success");
    //           // setStep(2);
    //         } else {
    //           toast.error(resData?.error || "Something went wrong!");
    //         }
    //       }
    //     } catch (error) {
    //       console.log(error);
    //       console.log("An error occured!");
    //     }
    //   } else {
    //     try {
    //       setLoading(true);
    //       const res = await confirmKYC({
    //         trx: "1234567890",
    //         otp: verificationCode,
    //       });
    //       setLoading(false);

    //       const resData = res.data;

    //       if (res.ok) {
    //         const user = resData?.user;

    //         updateUser({
    //           balance: user.balance,
    //           bvnVerified: user.bvnVerified,
    //           isKYC: user.isKYC,
    //         });
    //         toast.success("Verification Complete!");
    //         onComplete();
    //       } else {
    //         toast.error(resData?.error! || "Something went wrong!");
    //       }
    //     } catch (error) {
    //       console.log(error);
    //       console.log("An error occured!");
    //     }
    //   }
    // }

    if (method === "nin") {
      if (user?.balance! < 1000) {
        return toast.error(
          "Insufficient Balance. Cannot continue upgrade to Business Tier"
        );
      }

      if (step === 1) {
        try {
          setLoading(true);
          const res = await verifyKYC("nin", {
            dateOfBirth,
            firstName,
            lastName,
            number,
            phoneNumber,
          });
          setLoading(false);

          const resData = res.data;

          if (res.ok) {
            const data = resData?.data;

            if (data?.success! === false) {
              toast.error(
                `
                ${data?.message!}

                ${data?.warnings!}
                `,
                { removeDelay: 5000 }
              );
              return;
            } else {
              // setStep(2);
              // setMethod!("cac");
              const user = resData?.data!;

              updateUser({
                ninVerified: user.ninVerified,
                isKYC: user.isKYC,
                tier: user.tier,
              });

              toast.success(data?.message || "Success");

              onComplete();
            }
          } else {
            toast.error(resData?.error || "Something went wrong!");
          }
        } catch (error) {
          console.log(error);
          console.log("An error occured!");
        }
      }
    } else if (method === "cac") {
      if (user?.balance! < 5500) {
        return toast.error(
          "Insufficient Balance. Cannot continue upgrade to Merchant Tier."
        );
      }

      if (activeTab === "cac") {
        try {
          setLoading(true);
          const res = await verifyCAC({
            city: formData.city,
            company_name: formData.companyName,
            company_type: formData.companyType,
            email: formData.email,
            entity_type: formData.entityType,
            firstname: formData.firstName,
            surname: formData.lastName,
            rc_number: formData.rcNumber,
            occupation: formData.occupation,
            phoneNumber: formData.phoneNumber,
            gender: formData.gender,
          });
          setLoading(false);

          const resData = res.data;

          if (res.ok) {
            const user = resData?.data!;

            updateUser({
              ninVerified: user.ninVerified,
              cacVerified: user.cacVerified,
              isKYC: user.isKYC,
              tier: user.tier,
              balance: user.accountBalance,
              merchantVerificationCode: user.merchantVerificationCode,
            });
            toast.success("Success");

            onComplete();
          } else {
            toast.error(resData?.error || "Something went wrong!");
          }
        } catch (error) {
          console.log(error);
          console.log("An error occured!");
        }
      } else {
        if (!certificateFile) {
          toast.error("Please upload your certificate");
          return;
        }

        try {
          setLoading(true);
          const res = await verifyCorporateKYC({
            account_number: formData.account_number,
            business_name: formData.business_name,
            image: certificateFile,
            bank_name: formData.bank_name,
          });
          setLoading(false);

          const resData = res.data;

          if (res.ok) {
            const user = resData?.data!;

            updateUser({
              isKYC: user.isKYC,
              tier: user.tier,
              balance: user.accountBalance,
            });
            toast.success("Success");
            onComplete();
          } else {
            toast.error(resData?.error || "Something went wrong!");
          }
        } catch (error) {
          console.log(error);
          console.log("An error occured!");
        }
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mt-6"
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">
          {/* {method === "bvn" && "BVN Verification"} */}
          {method === "cac" && "CAC Verification"}
          {method === "nin" && "NIN Verification"}
        </h3>

        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-500"
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex items-center mb-4">
        <div
          className={`flex items-center justify-center w-8 h-8 rounded-full ${
            step === 1
              ? "bg-primary-600 text-white"
              : "bg-gray-200 text-gray-600"
          }`}
        >
          {step === 1 ? "1" : <Check size={16} />}
        </div>

        <div
          className={`flex-1 h-1 mx-2 ${
            step >= 2 ? "bg-primary-600" : "bg-gray-200"
          }`}
        ></div>

        <div
          className={`flex items-center justify-center w-8 h-8 rounded-full ${
            step === 2
              ? "bg-primary-600 text-white"
              : step > 2
              ? "bg-gray-200 text-gray-600"
              : "bg-gray-200 text-gray-600"
          }`}
        >
          {step <= 2 ? "2" : <Check size={16} />}
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {step === 1 && (
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                NIN Number
                {/* {method === "bvn" ? "BVN Number" : "NIN Number"} */}
              </label>

              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                  <Shield size={16} className="text-gray-400" />
                </div>

                <input
                  type="text"
                  name="number"
                  value={formData.number}
                  onChange={handleInputChange}
                  className="input pl-10"
                  // placeholder={
                  //   method === "bvn" ? "Enter your BVN" : "Enter your NIN"
                  // }
                  placeholder="Enter your NIN"
                  required
                  maxLength={11}
                  // pattern="\\d{11}"
                  // maxLength={method === "bvn" ? 11 : 11}
                  // pattern={method === "bvn" ? "\\d{11}" : "\\d{11}"}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>

                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                    <User size={16} className="text-gray-400" />
                  </div>

                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="input pl-10"
                    placeholder="First name"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                    <User size={16} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="input pl-10"
                    placeholder="Last name"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date of Birth
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                  <Calendar size={16} className="text-gray-400" />
                </div>

                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  className="input pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                  <Smartphone size={16} className="text-gray-400" />
                </div>

                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  className="input pl-10"
                  placeholder="Phone number"
                  required
                />
              </div>
            </div>
          </div>
        )}

        {/* {step === 2 && method === "bvn" && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <Smartphone className="h-5 w-5 text-blue-400" />
                </div>

                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    Verification Code Sent
                  </h3>

                  <div className="mt-2 text-sm text-blue-700">
                    <p>
                      We've sent a 6-digit verification code to{" "}
                      {formData.phoneNumber}. Please enter it below.
                    </p>
                  </div>
                </div>
              </div>
            </div>

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
                placeholder="Enter 6-digit code"
                required
                maxLength={6}
                pattern="\d{6}"
              />
            </div>

            <div className="text-sm text-gray-500">
              Didn't receive code?{" "}
              <button
                type="button"
                className="text-primary-600 hover:text-primary-700 font-medium"
                onClick={() => setStep(1)}
              >
                Check number
              </button>
            </div>
          </div>
        )} */}

        {step === 2 && method === "cac" && (
          <>
            <div className="flex border-b border-gray-200 mb-6">
              <button
                className={`py-2 px-4 font-medium text-sm ${
                  activeTab === "cac"
                    ? "border-b-2 border-primary-500 text-primary-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("cac")}
                type="button"
              >
                CAC
              </button>

              <button
                type="button"
                className={`py-2 px-4 font-medium text-sm ${
                  activeTab === "corporate"
                    ? "border-b-2 border-primary-500 text-primary-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("corporate")}
              >
                Corporate
              </button>
            </div>

            {activeTab === "cac" && (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      RC/BN Number
                    </label>

                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                        <CreditCard size={16} className="text-gray-400" />
                      </div>

                      <input
                        type="text"
                        name="rcNumber"
                        value={formData.rcNumber}
                        onChange={handleInputChange}
                        className="input pl-10"
                        placeholder="Enter RC/BN number"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Entity Type
                    </label>

                    <select
                      name="entityType"
                      value={formData.entityType}
                      onChange={handleInputChange}
                      className="input"
                      required
                    >
                      <option value="RC">RC</option>
                      <option value="BN">BN</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company Name
                  </label>

                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                      <Briefcase size={16} className="text-gray-400" />
                    </div>

                    <input
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleInputChange}
                      className="input pl-10"
                      placeholder="Company name (as registered)"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company Type
                  </label>

                  <select
                    name="companyType"
                    value={formData.companyType}
                    onChange={handleInputChange}
                    className="input"
                    required
                  >
                    <option value="RC">RC</option>
                    <option value="BN">BN</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>

                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                      <Mail size={16} className="text-gray-400" />
                    </div>

                    <input
                      type="text"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="input pl-10"
                      placeholder="Email Address (as registered)"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Director First Name
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="input"
                      placeholder="First name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Director Last Name
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="input"
                      placeholder="Last name"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Gender
                    </label>

                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className="input"
                      required
                    >
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                        <Smartphone size={16} className="text-gray-400" />
                      </div>
                      <input
                        type="tel"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        className="input pl-10"
                        placeholder="Phone number"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="input"
                      placeholder="City"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Occupation
                    </label>
                    <input
                      type="text"
                      name="occupation"
                      value={formData.occupation}
                      onChange={handleInputChange}
                      className="input"
                      placeholder="Occupation"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "corporate" && (
              <CorporateKYCForm
                formData={formData}
                setFormData={setFormData}
                certificateFile={certificateFile}
                setCertificateFile={setCertificateFile!}
              />
            )}
          </>
        )}

        <div className="mt-4 flex justify-end space-x-3">
          {/* {step === 2 && (
            <button
              type="button"
              onClick={() => setStep(1)}
              className="btn btn-outline"
            >
              Back
            </button>
          )} */}

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Loading..." : "Submit "}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default KYCMethod;
