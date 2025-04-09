import { FaUser } from "react-icons/fa";

export default function DefaultAvatar({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-14 h-14"
  };

  return (
    <div className={`${sizeClasses[size]} rounded-full bg-gray-200 flex items-center justify-center`}>
      <FaUser className="text-gray-500 text-lg" />
    </div>
  );
} 