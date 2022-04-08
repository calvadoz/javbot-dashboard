import { toast } from "react-toastify";

const toastOptions = {
  theme: "colored",
  position: toast.POSITION.TOP_RIGHT,
  pauseOnFocusLoss: false,
  toastId: "some-id",
};

const toastOptionsInfo = {
  theme: "colored",
  position: toast.POSITION.TOP_RIGHT,
  pauseOnFocusLoss: false,
  style: { background: "#2741b3", fontFamily: 'Montserrat', fontSize: "14px"},
};

export const showError = (message) => {
  toast.error(message, toastOptions);
};

export const showInfo = (message) => {
  toast.info(message, toastOptionsInfo);
};

export const showWarning = (message) => {
  toast.warn(message, toastOptions);
};

export const showSuccess = (message) => {
  toast.success(message, toastOptions);
};
