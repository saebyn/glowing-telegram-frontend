/**
 * GenericWidgetSkeleton
 *
 * Generic loading skeleton for widgets when the specific widget type is unknown.
 * Shows a simple animated placeholder while the widget data is being loaded.
 */
function GenericWidgetSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-transparent p-8">
      <div className="max-w-2xl w-full">
        {/* Main Content Box */}
        <div className="bg-black bg-opacity-40 backdrop-blur-lg rounded-3xl p-8 md:p-12 shadow-2xl border border-purple-500 border-opacity-30">
          <div className="space-y-6">
            {/* Header Skeleton */}
            <div className="flex justify-center">
              <div className="h-12 bg-white bg-opacity-30 rounded-lg w-3/4 animate-pulse" />
            </div>

            {/* Content Area Skeleton */}
            <div className="space-y-4">
              <div className="h-32 bg-white bg-opacity-20 rounded-lg w-full animate-pulse" />
              <div className="h-8 bg-white bg-opacity-15 rounded-lg w-2/3 mx-auto animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GenericWidgetSkeleton;
