import { ShieldCheck, BadgeCheck } from "lucide-react";

interface VerificationStatusProps {
  type: "bvn" | "nin";
}

const VerificationStatus: React.FC<VerificationStatusProps> = ({ type }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mt-4">
      <div className="flex flex-col items-center text-center">
        <div className="p-3 bg-green-100 rounded-full mb-2">
          <ShieldCheck className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">
          Identity Verified
        </h3>

        <p className="text-sm text-gray-500 mb-4">
          Your {type.toUpperCase()} verification was successful
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
              <BadgeCheck className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-sm text-green-700">Verified</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationStatus;
