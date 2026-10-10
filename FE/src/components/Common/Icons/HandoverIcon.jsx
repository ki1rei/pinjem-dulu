const HandoverIcon = ({ className = '', strokeWidth = 1.75 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M7 10V7a3 3 0 0 1 3-3h10v12h-4" />
    <path d="M13 14a1 1 0 1 0-2 0v2a3 3 0 0 1-3 3H7a4 4 0 0 1-4-4v-3a1 1 0 1 1 2 0v1" />
    <path d="M11 14a1 1 0 1 0-2 0v1a1 1 0 1 1-2 0V11a1 1 0 1 0-2 0v4" />
    <circle cx="18" cy="18" r="3" />
    <path d="M22 22l-1.5-1.5" />
  </svg>
);

export default HandoverIcon;
