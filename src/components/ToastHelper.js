import { toast } from "react-toastify";
import { v4 as uuidv4 } from "uuid";

const toastOptions = {
  theme: "colored",
  position: toast.POSITION.TOP_RIGHT,
  pauseOnFocusLoss: false,
  toastId: uuidv4(),
};

const toastOptionsInfoBlue = {
  theme: "colored",
  position: toast.POSITION.TOP_RIGHT,
  pauseOnFocusLoss: false,
  style: { background: "#2741b3", fontFamily: "Montserrat", fontSize: "14px" },
};

const toastOptionsInfoGreen = {
  theme: "colored",
  position: toast.POSITION.TOP_RIGHT,
  pauseOnFocusLoss: false,
  style: { background: "#27b35f", fontFamily: "Montserrat", fontSize: "14px" },
};
const toastOptionsInfoYellow = {
  theme: "colored",
  position: toast.POSITION.TOP_RIGHT,
  pauseOnFocusLoss: false,
  style: { background: "#d77e0f", fontFamily: "Montserrat", fontSize: "14px" },
};

export const showError = (message) => {
  toast.error(message, toastOptions);
};

export const showInfo = (message) => {
  toast.info(message, toastOptionsInfoBlue);
};

export const showWarning = (message) => {
  toast.warn(message, toastOptionsInfoYellow);
};

export const showSuccess = (message) => {
  toast.success(message, toastOptionsInfoGreen);
};
