interface CountdownTimerSkeletonProps {
  width?: number; // Widget width in pixels
  height?: number; // Widget height in pixels
}

/**
 * CountdownTimerSkeleton
 *
 * Loading skeleton for the countdown timer widget.
 * Shows an animated placeholder while the widget data is being loaded.
 */
function CountdownTimerSkeleton({
  width,
  height,
}: CountdownTimerSkeletonProps = {}) {
  const containerStyle: React.CSSProperties = {};
  if (width) {
    containerStyle.width = `${width}px`;
  }
  if (height) {
    containerStyle.height = `${height}px`;
  }
  if (width || height) {
    containerStyle.overflow = 'hidden';
  }

  return (
    <div className="p-8" style={containerStyle}>
      <div className="max-w-2xl w-full space-y-8">
        {/* Text and Title Skeleton */}
        <div className="text-center space-y-4">
          {/* Text skeleton */}
          <div className="flex justify-center">
            <div className="h-7 bg-white bg-opacity-20 rounded-lg w-3/4 animate-pulse" />
          </div>
          {/* Title skeleton */}
          <div className="flex justify-center">
            <div className="h-16 bg-white bg-opacity-30 rounded-lg w-5/6 animate-pulse" />
          </div>
        </div>

        {/* Timer Display Skeleton */}
        <div className="bg-black bg-opacity-40 backdrop-blur-lg rounded-3xl p-8 md:p-12 shadow-2xl border border-purple-500 border-opacity-30">
          <div className="text-center space-y-6">
            {/* Main Timer Skeleton */}
            <div className="flex justify-center">
              <div className="h-24 bg-white bg-opacity-30 rounded-lg w-4/5 animate-pulse" />
            </div>

            {/* Progress Bar Skeleton */}
            <div className="relative w-full h-4 bg-gray-700 bg-opacity-50 rounded-full overflow-hidden">
              <div className="absolute left-0 top-0 h-full w-2/3 bg-white bg-opacity-20 animate-pulse" />
            </div>

            {/* Original Duration Skeleton */}
            <div className="flex justify-center">
              <div className="h-6 bg-white bg-opacity-20 rounded-lg w-1/2 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CountdownTimerSkeleton;
