export const Heading1 = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <h1 className={`text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-400 text-transparent bg-clip-text ${className}`}>
    {children}
  </h1>
);

export const Heading2 = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <h2 className={`text-3xl font-bold ${className}`}>
    {children}
  </h2>
);

export const Paragraph = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <p className={`text-gray-300 ${className}`}>
    {children}
  </p>
);