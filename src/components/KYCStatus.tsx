import { ShieldCheck, BadgeCheck, Clock } from "lucide-react";

interface VerificationStatusProps {
  type: "nin" | "nin & cac/legal search";
  state: "pending" | "verified";
}

const VerificationStatus: React.FC<VerificationStatusProps> = ({
  type,
  state,
}) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mt-4">
      <div className="flex flex-col items-center text-center">
        <div
          className={`p-3 bg-${
            state === "pending" ? "yellow" : "green"
          }-100 rounded-full mb-2`}
        >
          {state === "pending" ? (
            <Clock className="h-8 w-8 text-yellow-500" />
          ) : (
            <ShieldCheck className="h-8 w-8 text-green-600" />
          )}
          {/* <Clock className="h-3 w-3 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
          <ShieldCheck className="h-8 w-8 text-green-600" /> */}
        </div>

        <h3 className="text-lg font-medium text-gray-900 mb-1">
          Identity {state === "pending" ? "Verification Pending" : "Verified"}
        </h3>

        <p className="text-sm text-gray-500 mb-4">
          Your {type.toUpperCase()} verification{" "}
          {state === "pending" ? "is pending" : "was successful"}
        </p>

        <div className="w-full max-w-md bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between py-2">
            <span className="text-sm font-medium text-gray-500">
              Verification Method
            </span>

            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {type.toUpperCase()}
            </span>
          </div>

          <div className="flex items-center justify-between py-2 border-t border-gray-200">
            <span className="text-sm font-medium text-gray-500">Status</span>
            <span className="inline-flex items-center">
              <BadgeCheck
                className={`h-4 w-4 text-${
                  state === "pending" ? "yellow" : "green"
                }-500 mr-1`}
              />

              <span
                className={`text-sm text-${
                  state === "pending" ? "yellow" : "green"
                }-700`}
              >
                {state === "pending" ? "Pending" : "Verified"}
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationStatus;
