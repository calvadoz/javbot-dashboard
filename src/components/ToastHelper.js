import { toast } from "react-toastify";

const toastOptions = {
  theme: "colored",
  position: toast.POSITION.TOP_CENTER,
  pauseOnFocusLoss: false,
};

export const showError = (message) => {
  toast.error(message, toastOptions);
};

export const showInfo = (message) => {
  toast.info(message, toastOptions);
};

export const showWarning = (message) => {
  toast.warn(message, toastOptions);
};

export const showSuccess = (message) => {
  toast.success(message, toastOptions);
};
