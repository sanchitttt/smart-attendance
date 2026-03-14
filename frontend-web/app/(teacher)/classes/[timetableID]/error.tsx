'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold">Some error occurred!</h2>

      {/* You CAN see the error */}
      <p className="mt-2 text-red-600">
        {error.message}
      </p>

      {/* Optional retry */}
      <button
        onClick={() => reset()}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
      >
        Try again
      </button>
    </div>
  );
}
