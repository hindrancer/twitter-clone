import { FaUser } from "react-icons/fa";

export default function DefaultAvatar({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-36 h-36"
  };

  const iconSizeClasses = {
    sm: "text-md",
    md: "text-xl",
    lg: "text-6xl"
  };

  return (
    <div className={`${sizeClasses[size]} rounded-full bg-gray-200 flex items-center justify-center`}>
      <FaUser className={`text-gray-500 ${iconSizeClasses[size]}`} />
    </div>
  );
} 