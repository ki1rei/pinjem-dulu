const UsersIcon = ({ className = '', strokeWidth = 1.75 }) => (
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
    <circle cx="9" cy="8" r="3.5" />
    <path d="M2.5 20c.8-3.5 3.5-5.5 6.5-5.5s5.7 2 6.5 5.5" />
    <circle cx="17" cy="9" r="2.8" />
    <path d="M15.5 20c.4-2.3 2.1-3.8 4-4.1" />
    <path d="M21.5 20c-.4-2.4-2.2-3.9-4-4.1" />
  </svg>
);

export default UsersIcon;
