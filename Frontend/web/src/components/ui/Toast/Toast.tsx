import { useEffect, useState } from "react";
import "./toast.css";

interface ToastProps {
  id: string;
  type: "success" | "error";
  message: string;
  onClose: (id: string) => void;
}

const SuccessIcon = () => (
  <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" clipRule="evenodd" d="M8.25 1.5C4.52208 1.5 1.5 4.52208 1.5 8.25C1.5 11.9779 4.52208 15 8.25 15C11.9779 15 15 11.9779 15 8.25C15 4.52208 11.9779 1.5 8.25 1.5ZM0 8.25C0 3.69365 3.69365 0 8.25 0C12.8063 0 16.5 3.69365 16.5 8.25C16.5 12.8063 12.8063 16.5 8.25 16.5C3.69365 16.5 0 12.8063 0 8.25ZM11.0303 6.21967C11.3232 6.51256 11.3232 6.98744 11.0303 7.28033L8.03033 10.2803C7.73744 10.5732 7.26256 10.5732 6.96967 10.2803L5.46967 8.78033C5.17678 8.48744 5.17678 8.01256 5.46967 7.71967C5.76256 7.42678 6.23744 7.42678 6.53033 7.71967L7.5 8.68934L9.96967 6.21967C10.2626 5.92678 10.7374 5.92678 11.0303 6.21967Z" fill="#2ECC71"/>
  </svg>
);

const ErrorIcon = () => (
  <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" clipRule="evenodd" d="M2.475 1.65C2.01937 1.65 1.65 2.01937 1.65 2.475V14.025C1.65 14.4806 2.01936 14.85 2.475 14.85H14.025C14.4806 14.85 14.85 14.4806 14.85 14.025V2.475C14.85 2.01936 14.4806 1.65 14.025 1.65H2.475ZM0 2.475C0 1.1081 1.1081 0 2.475 0H14.025C15.3919 0 16.5 1.1081 16.5 2.475V14.025C16.5 15.3919 15.3919 16.5 14.025 16.5H2.475C1.1081 16.5 0 15.3919 0 14.025V2.475ZM5.19164 5.19164C5.51382 4.86945 6.03618 4.86945 6.35836 5.19164L8.25 7.08327L10.1416 5.19164C10.4638 4.86945 10.9862 4.86945 11.3084 5.19164C11.6305 5.51382 11.6305 6.03618 11.3084 6.35836L9.41673 8.25L11.3084 10.1416C11.6305 10.4638 11.6305 10.9862 11.3084 11.3084C10.9862 11.6305 10.4638 11.6305 10.1416 11.3084L8.25 9.41673L6.35836 11.3084C6.03618 11.6305 5.51382 11.6305 5.19164 11.3084C4.86945 10.9862 4.86945 10.4638 5.19164 10.1416L7.08327 8.25L5.19164 6.35836C4.86945 6.03618 4.86945 5.51382 5.19164 5.19164Z" fill="#FF4C4C"/>
  </svg>
);

export const Toast = ({ id, type, message, onClose }: ToastProps) => {
  const [removing, setRemoving] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setRemoving(true);
      setTimeout(() => onClose(id), 300);
    }, 4000);

    return () => clearTimeout(timer);
  }, [id, onClose]);

  const handleClick = () => {
    setRemoving(true);
    setTimeout(() => onClose(id), 300);
  };

  return (
    <div className={`toast ${type} ${removing ? "removing" : ""}`} onClick={handleClick}>
      <span className="toast-icon">
        {type === "success" ? <SuccessIcon /> : <ErrorIcon />}
      </span>
      <span>{message}</span>
    </div>
  );
};
