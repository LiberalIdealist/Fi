// components/ui/Button.jsx
export function Button({ children, variant = "primary", ...props }) {
  const baseClasses = "px-4 py-2 rounded-md transition-all";
  const variants = {
    primary: "bg-gradient-to-r from-blue-500 to-purple-500 text-white",
    secondary: "bg-gray-700 hover:bg-gray-600 text-white",
    outline: "border border-gray-300 text-gray-300 hover:bg-gray-700"
  };
  
  return (
    <button 
      className={`${baseClasses} ${variants[variant]}`} 
      {...props}
    >
      {children}
    </button>
  );
}