export function InstaPayLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" rx="10" fill="#6C2EB9" />
      <path
        d="M12 26 20 12l8 14"
        stroke="#fff"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path d="M15.5 21h9" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  );
}

export function VodafoneCashLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="20" fill="#E60000" />
      <path
        d="M25.5 11c-5.2 1.2-7.7 4.9-7.3 10.4 0 0-1.3-.2-2-1.3-1 3.4.7 8 5 8.6 5.6.8 9.4-3.4 8.6-8.4-.5-3.2-2.9-3.9-2.9-3.9s1.4-1.7 1.1-4c-.2-1.7-1.1-2.9-2.5-1.4z"
        fill="#fff"
      />
    </svg>
  );
}
