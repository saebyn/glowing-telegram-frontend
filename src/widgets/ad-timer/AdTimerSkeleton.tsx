/**
 * AdTimerSkeleton
 *
 * Loading skeleton for the Ad Timer Widget
 */
function AdTimerSkeleton() {
  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="bg-gray-400 animate-pulse px-6 py-3 rounded-lg shadow-lg">
        <div className="h-6 w-48 bg-gray-300 rounded" />
      </div>
    </div>
  );
}

export default AdTimerSkeleton;
