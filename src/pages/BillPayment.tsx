import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Smartphone, Wifi, Gift, Tv, Zap, Book } from "lucide-react";
import { formatCurrency } from "../utils/formatters";
import toast from "react-hot-toast";

import { useAuthStore } from "../stores/authStore";

import { AIRTEL, GLO, MTN, NINE_MOBILE } from "../constants/data-plans";
import { ELECTRICITY_BILLERS } from "../constants/electricity-billers";
import { DSTV, GOTV, SHOWMAX, STARTIMES } from "../constants/cable-providers";

import { purchaseAirtme, purchaseData } from "../services/bills-payments";

const billTypes = {
  airtime: {
    title: "Airtime Top-up",
    icon: <Smartphone className="h-6 w-6 text-primary-600" />,
    description: "Recharge your mobile phone or others",
  },
  data: {
    title: "Data Subscription",
    icon: <Wifi className="h-6 w-6 text-primary-600" />,
    description: "Purchase internet data plans",
  },
  "recharge-card": {
    title: "Recharge Card Printing",
    icon: <Gift className="h-6 w-6 text-primary-600" />,
    description: "Generate recharge cards for resale",
  },
  "cable-tv": {
    title: "Cable TV Subscription",
    icon: <Tv className="h-6 w-6 text-primary-600" />,
    description: "Renew your cable TV subscription",
  },
  electricity: {
    title: "Electricity Bill Payment",
    icon: <Zap className="h-6 w-6 text-primary-600" />,
    description: "Pay your electricity bills",
  },
  "education-pin": {
    title: "Education PIN Purchase",
    icon: <Book className="h-6 w-6 text-primary-600" />,
    description: "Buy examination PINs and results checker",
  },
};

const BillPayment: React.FC = () => {
  const location = useLocation();
  const { user } = useAuthStore();

  const [billPaymentData, setBillPaymentData] = useState({
    amount: "",
    service_name: "",
    service_id: "",
    phone: "",
    variation_code: "",
    meter_type: "",
  });
  const [dataPlanType, setDataPlanType] = useState("");
  const [variations, setVariations] = useState([
    {
      variation_code: "",
      name: "",
      variation_amount: "",
      fixedPrice: "",
    },
  ]);

  const [dataPlanTypes, setDataPlanTypes] = useState<
    { value: string; label: string }[]
  >([{ label: "", value: "" }]);
  const [dataPlans, setDataPlans] = useState<
    {
      variation_code: string;
      name: string;
      variation_amount: string;
      fixedPrice: string;
      planType: string;
    }[]
  >([
    {
      variation_code: "",
      name: "",
      variation_amount: "",
      fixedPrice: "",
      planType: "",
    },
  ]);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (billPaymentData.service_id !== "") {
      switch (billPaymentData.service_id) {
        case "mtn-data":
          setDataPlanTypes(MTN.planTypes);
          break;
        case "airtel-data":
          setDataPlanTypes(AIRTEL.planTypes);
          break;
        case "glo-data":
          setDataPlanTypes(GLO.planTypes);
          break;
        case "etisalat-data":
          setDataPlanTypes(NINE_MOBILE.planTypes);
          break;
        default:
          setDataPlanTypes([]);
          break;
      }
    }
  }, [billPaymentData.service_id]);

  useEffect(() => {
    if (dataPlanType !== "") {
      switch (billPaymentData.service_id) {
        case "mtn-data":
          const mtnDPlans = MTN.dataPlans.filter(
            (data) => data.planType === dataPlanType
          );
          setDataPlans(mtnDPlans);
          setBillPaymentData((prev) => ({ ...prev, amount: "" }));
          break;
        case "airtel-data":
          const airtelDPlans = AIRTEL.dataPlans.filter(
            (data) => data.planType === dataPlanType
          );
          setDataPlans(airtelDPlans);
          setBillPaymentData((prev) => ({ ...prev, amount: "" }));
          break;
        case "glo-data":
          const gloDPlans = GLO.dataPlans.filter(
            (data) => data.planType === dataPlanType
          );
          setDataPlans(gloDPlans);
          setBillPaymentData((prev) => ({ ...prev, amount: "" }));
          break;
        case "etisalat-data":
          const etisalatDataPlans = NINE_MOBILE.dataPlans.filter(
            (data) => data.planType === dataPlanType
          );
          setDataPlans(etisalatDataPlans);
          setBillPaymentData((prev) => ({ ...prev, amount: "" }));
          break;
      }
    }
  }, [dataPlanType]);

  useEffect(() => {
    if (billPaymentData.variation_code !== "") {
      if (billType === "data") {
        const currentDataPlan = dataPlans.filter(
          (dplan) => dplan.variation_code === billPaymentData.variation_code
        )[0];
        setBillPaymentData((prev) => ({
          ...prev,
          amount: currentDataPlan.variation_amount,
          service_name: currentDataPlan.name,
        }));
      }

      if (billType === "cable-tv") {
        const currentCablePlan = variations.filter(
          (variation) =>
            variation.variation_code === billPaymentData.variation_code
        )[0];

        setBillPaymentData((prev) => ({
          ...prev,
          amount: currentCablePlan.variation_amount,
          // service_name: currentDataPlan.name,
        }));
      }
    }
  }, [billPaymentData.variation_code]);

  useEffect(() => {
    switch (billPaymentData.service_name) {
      case "dstv":
        setVariations(DSTV);
        setBillPaymentData((prev) => ({ ...prev, amount: "" }));
        break;
      case "gotv":
        setVariations(GOTV);
        setBillPaymentData((prev) => ({ ...prev, amount: "" }));
        break;
      case "startimes":
        setVariations(STARTIMES);
        setBillPaymentData((prev) => ({ ...prev, amount: "" }));
        break;
      case "showmax":
        setVariations(SHOWMAX);
        setBillPaymentData((prev) => ({ ...prev, amount: "" }));
        break;
      default:
        break;
    }
  }, [billPaymentData.service_name]);

  const pathParts = location.pathname.split("/");
  const billType = pathParts[pathParts.length - 1] as keyof typeof billTypes;

  useEffect(() => {
    setBillPaymentData({
      amount: "",
      meter_type: "",
      phone: "",
      service_id: "",
      service_name: "",
      variation_code: "",
    });
  }, [billType]);

  const currentBill = billTypes[billType] || {
    title: "Bill Payment",
    icon: null,
    description: "",
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    setBillPaymentData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const {
      amount,
      phone,
      service_id: _,
      service_name,
      variation_code,
    } = billPaymentData;

    if (user && user.balance < Number(amount))
      return toast.error("Insufficient balance");

    switch (billType) {
      case "airtime":
        if (!amount || !phone || !service_name)
          return alert("All fields are required");
        else {
          try {
            setLoading(true);
            const res = await purchaseAirtme({ amount, phone, service_name });
            setLoading(false);

            console.log(res);
          } catch (error) {
            console.log(error);
            setLoading(false);
          }
        }

        break;
      case "data":
        if (
          !amount ||
          !phone ||
          !service_name ||
          !service_name ||
          !variation_code
        ) {
          try {
            // const res = await purchaseData({
            //   amount,
            //   phone,
            //   service_id,
            //   variation_code,
            //   service_name,
            // });
          } catch (error) {
            console.log(error);
            setLoading(false);
          }
        }
        break;
      default:
        break;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            {currentBill.icon && (
              <span className="mr-3">{currentBill.icon}</span>
            )}
            {currentBill.title}
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            {currentBill.description}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-card shadow-card p-6">
        <form className="space-y-2" onSubmit={handleSubmit}>
          {(billType === "airtime" ||
            billType === "data" ||
            billType === "electricity") && (
            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Phone Number
              </label>

              <input
                type="tel"
                id="phone"
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter phone number"
                onChange={handleChange}
                name="phone"
                required
              />
            </div>
          )}

          <div>
            <label
              htmlFor="network"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Select Network/Provider
            </label>

            <select
              id="network"
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
              name={billType === "data" ? "service_id" : "service_name"}
              onChange={handleChange}
              required
            >
              <option value="">Select an option</option>
              {billType === "airtime" ? (
                <>
                  <option value="mtn">MTN</option>
                  <option value="airtel">Airtel</option>
                  <option value="glo">Glo</option>
                  <option value="etisalat">9mobile</option>
                </>
              ) : billType === "data" ? (
                <>
                  <option value="mtn-data">MTN Data</option>
                  <option value="airtel-data">Airtel Data</option>
                  <option value="glo-data">Glo Data</option>
                  <option value="etisalat-data">9mobile Data</option>
                  {/* <option value="spectranet">Spectranet</option>
                  <option value="smile-direct">Smile Direct</option> */}
                </>
              ) : billType === "cable-tv" ? (
                <>
                  <option value="dstv">DStv Subscription</option>
                  <option value="gotv">GOtv Payment</option>
                  <option value="startimes">StarTimes Subscription</option>
                  <option value="showmax">ShowMax</option>
                </>
              ) : billType === "electricity" ? (
                ELECTRICITY_BILLERS.map((electricBiller, i) => (
                  <option key={i} value={electricBiller.value}>
                    {electricBiller.name}
                  </option>
                ))
              ) : null}
            </select>
          </div>

          {billType === "data" && billPaymentData.service_id !== "" && (
            <div>
              <label
                htmlFor="plan_type"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Data Plan Type
              </label>

              <select
                disabled={billPaymentData.service_id === ""}
                id="variation_code"
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                value={dataPlanType}
                onChange={(e) => setDataPlanType(e.target.value)}
                required
              >
                <option value="">Select an option</option>
                {dataPlanTypes.map((plan, i) => (
                  <option key={i} value={plan.value}>
                    {plan.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {billType === "data" && dataPlanType !== "" && (
            <div>
              <label
                htmlFor="plan_type"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Data Plan
              </label>

              <select
                disabled={billPaymentData.service_id === ""}
                id="variation_code"
                name="variation_code"
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                value={billPaymentData.variation_code}
                onChange={handleChange}
                required
              >
                <option value="">Select an option</option>
                {dataPlans.map((plan, i) => (
                  <option key={i} value={plan.variation_code}>
                    {plan.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {billType === "cable-tv" && (
            <div>
              <label
                htmlFor="subscription-variation"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Subscription Variation
              </label>

              <select
                id="subscription-variation"
                name="variation_code"
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                value={billPaymentData.variation_code}
                onChange={handleChange}
                required
              >
                <option value="">Select an option</option>
                {variations.map((sVariation, i) => (
                  <option key={i} value={sVariation.variation_code}>
                    {sVariation.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label
              htmlFor="amount"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Amount
            </label>

            <input
              disabled={billType === "data" || billType === "cable-tv"}
              type="number"
              name="amount"
              onChange={handleChange}
              id="amount"
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
              placeholder="Enter amount"
              required
              value={billPaymentData.amount}
            />
          </div>

          {/* {billType === "recharge-card" && (
            <div>
              <label
                htmlFor="quantity"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Quantity
              </label>

              <input
                type="number"
                id="quantity"
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                placeholder="Number of cards to generate"
              />
            </div>
          )} */}

          {billType === "electricity" && (
            <div>
              <label
                htmlFor="meter"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Meter Number
              </label>

              <input
                type="text"
                id="meter"
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter meter number"
              />
            </div>
          )}

          {billType === "electricity" && (
            <div>
              <label
                htmlFor="meter_type"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Meter Type
              </label>

              <select
                id="meter_type"
                name="meter_type"
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                value={billPaymentData.meter_type}
                onChange={handleChange}
                required
              >
                <option value="">Select an option</option>
                <option value="prepaid">Prepaid</option>
                <option value="postpaid">Postpaid</option>
              </select>
            </div>
          )}

          <div className="">
            <button
              disabled={loading}
              className="w-full flex justify-center bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors font-medium"
              type="submit"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-3 w-2 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Processing...</span>
                </span>
              ) : (
                <>
                  Proceed to Pay{" "}
                  {formatCurrency(Number(billPaymentData.amount))}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default BillPayment;
