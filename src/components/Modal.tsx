// components/Modal.tsx
import { Dialog } from "@headlessui/react";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
};

export const Modal = ({
  isOpen,
  onClose,
  title,
  description,
  actionText,
  onAction,
}: ModalProps) => {
  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-lg z-50">
        <Dialog.Title className="text-xl font-bold text-gray-900 mb-3">
          {title}
        </Dialog.Title>
        <Dialog.Description className="mb-5 text-gray-700">
          {description}
        </Dialog.Description>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            Close
          </button>
          {actionText && onAction && (
            <button
              onClick={onAction}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              {actionText}
            </button>
          )}
        </div>
      </div>
    </Dialog>
  );
};
