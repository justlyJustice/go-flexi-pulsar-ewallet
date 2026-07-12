import React, { useEffect, useState } from "react";
import { Dialog, Description, DialogTitle } from "@headlessui/react";

import { FileDigit } from "lucide-react";

import { useAuthStore } from "../stores/authStore";

export const CollectDetailsModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const user = useAuthStore((store) => store.user);

  useEffect(() => {
    if (!user?.ninNumber || !user?.cacNumber) {
      setIsOpen(true);
    }

    return () => setIsOpen(false);
  }, [user]);

  const [values, setValues] = useState({
    nin: "",
    cac: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setValues((prevValues) => ({ ...prevValues, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <Dialog
      open={isOpen}
      onClose={() => setIsOpen(false)}
      className="fixed inset-0 z-50 flex items-center justify-center p-2"
    >
      <div className="fixed inset-0 bg-black/90" aria-hidden="true" />

      <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-lg z-50">
        <DialogTitle className="text-xl font-bold text-gray-900">
          Enter NIN/CAC
        </DialogTitle>

        <Description className="mb-1 text-gray-700">
          These details are needed for revalidation.
        </Description>

        {/* {error && (
          <div className="mb-2 p-2 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )} */}

        <form className="my-2" onSubmit={handleSubmit}>
          {user?.ninVerified && (
            <div className="mb-1">
              <label
                htmlFor="nin"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                NIN
              </label>

              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-1 flex items-center pointer-events-none">
                  <FileDigit className="h-4 w-3 text-gray-400" />
                </div>

                <input
                  type="text"
                  id="nin"
                  name="nin"
                  className="input pl-10"
                  placeholder="0123456789"
                  value={values.nin}
                  onChange={handleChange}
                  minLength={11}
                  required
                />
              </div>
            </div>
          )}

          {user?.cacVerified && (
            <div className="mb-1">
              <label
                htmlFor="cac"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                CAC
              </label>

              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-1 flex items-center pointer-events-none">
                  <FileDigit className="h-4 w-3 text-gray-400" />
                </div>

                <input
                  type="text"
                  id="cac"
                  name="cac"
                  className="input pl-10"
                  placeholder="0123456789"
                  value={values.cac}
                  onChange={handleChange}
                  // minLength={11}
                  required
                />
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 mt-3">
            <button
              onClick={() => {
                setIsOpen(false);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              type="button"
            >
              Close
            </button>

            <button
              // disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              type="submit"
            >
              {/* {loading ? "Validating" : "Create"} */}
              Submit
            </button>
          </div>
        </form>
      </div>
    </Dialog>
  );
};
