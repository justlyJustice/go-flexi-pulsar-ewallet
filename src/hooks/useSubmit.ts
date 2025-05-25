"use client";

import { ApiResponse } from "apisauce";
import { useRef, useEffect, useState } from "react";
import toast from "react-hot-toast";

interface UseSubmitOptions {
  resetDelay?: number; // milliseconds before auto-resetting error/success
}

type ResponseData =
  | {
      error: string;
      data?: string;
    }
  | any
  | null;

type CustomResponse = {
  error: string;
  data: ResponseData;
  user?: any;
  token?: string;
  success: boolean;
};

const useSubmit = (submitFunc: any, options?: UseSubmitOptions) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isError, setIsError] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      // Cleanup timeout if component unmounts
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const submit = async (
    ...funcParams: any[]
  ): Promise<ApiResponse<CustomResponse> | null> => {
    setIsSubmitting(true);

    try {
      const res = await submitFunc(...funcParams);
      setIsSubmitting(false);

      if (!res) {
        setIsError(true);
        setMessage("Server connection error!");
        return null;
      }

      if (!res.ok) {
        setIsError(true);
        setMessage(
          res?.data?.error ||
            res.originalError.message ||
            "Something went wrong"
        );
        toast.error(
          res?.data?.error ||
            res.originalError.message ||
            "Something went wrong"
        );

        if (options?.resetDelay) {
          timeoutRef.current = setTimeout(() => {
            setIsError(false);
            setMessage("");
          }, options.resetDelay);
        }

        return null;
      }

      setMessage(res.data?.data?.message);
      setSuccess(true);

      if (options?.resetDelay) {
        timeoutRef.current = setTimeout(() => {
          setSuccess(false);
          setMessage("");
        }, options.resetDelay);
      }

      return res;
    } catch (err: any) {
      setIsSubmitting(false);
      setIsError(true);
      setMessage(err?.message || "An unexpected error occurred");
      return null;
    }
  };

  return { isSubmitting, isError, message, submit, success };
};

export default useSubmit;
