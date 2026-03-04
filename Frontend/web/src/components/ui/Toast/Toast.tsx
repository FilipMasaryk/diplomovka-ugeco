import { useEffect, useState } from "react";
import { FiCheckCircle, FiXOctagon } from "react-icons/fi";
import "./toast.css";

interface ToastProps {
  id: string;
  type: "success" | "error";
  message: string;
  onClose: (id: string) => void;
}

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
        {type === "success" ? <FiCheckCircle /> : <FiXOctagon />}
      </span>
      <span>{message}</span>
    </div>
  );
};
