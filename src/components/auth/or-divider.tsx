export function OrDivider() {
    return (
      <div className="relative my-2">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-6 bg-white text-gray-600 font-medium uppercase tracking-wider">or</span>
        </div>
      </div>
    );
  }