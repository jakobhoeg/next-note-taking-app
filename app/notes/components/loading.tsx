export const LoadingSection = () => {
  return (
    <div className="flex animate-pulse">
      <svg
        width="20"
        height="4"
        viewBox="0 0 20 4"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="4" height="4" rx="2" fill="#364153" />
        <g opacity="0.8">
          <rect x="8" width="4" height="4" rx="2" fill="#364153" />
        </g>
        <g opacity="0.6">
          <rect x="16" width="4" height="4" rx="2" fill="#364153" />
        </g>
      </svg>
    </div>
  );
};
