/**
 * @param {'up'|'down'|'left'|'right'} [direction='down']
 */
const ChevronIcon = ({ className = '', direction = 'down', strokeWidth = 2 }) => {
  const rotate =
    {
      up: 'rotate-180',
      down: 'rotate-0',
      left: 'rotate-90',
      right: '-rotate-90',
    }[direction] || 'rotate-0';

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`transition-transform ${rotate} ${className}`}
      aria-hidden="true"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
};

export default ChevronIcon;
