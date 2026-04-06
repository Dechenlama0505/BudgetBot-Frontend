import { toast } from "react-toastify";

const defaultOptions = {
  position: "top-center",
  autoClose: 2500,
  hideProgressBar: true,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: false,
};

export const showSuccess = (message = "Success") => {
  return toast.success(message, defaultOptions);
};

export const showError = (error, fallback = "Something went wrong") => {
  const message =
    typeof error === "string" ? error : error?.message || fallback;

  toast.error(message, defaultOptions);
  return message;
};
