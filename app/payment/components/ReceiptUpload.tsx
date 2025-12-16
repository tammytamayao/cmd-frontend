"use client";

export function ReceiptUpload({
  inputId,
  accept,
  required,
  file,
  error,
  onFiles,
  onDrop,
  onRemove,
}: {
  inputId: string;
  accept: string[];
  required: boolean;
  file: File | null;
  error: string | null;
  onFiles: (files: FileList | null) => void;
  onDrop: (e: React.DragEvent<HTMLLabelElement>) => void;
  onRemove: () => void;
}) {
  return (
    <div>
      <input
        id={inputId}
        type="file"
        accept={accept.join(",")}
        className="sr-only"
        onChange={(e) => onFiles(e.target.files)}
      />

      <label
        htmlFor={inputId}
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        className="mt-2 grid place-items-center h-44 rounded-lg border border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
      >
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="h-10 w-10 rounded-full bg-indigo-100 text-indigo-600 grid place-items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-6 w-6"
              aria-hidden="true"
            >
              <path d="M12 2a10 10 0 1 0 10 10A10.011 10.011 0 0 0 12 2Zm1 14h-2v-2h2Zm0-4h-2V6h2Z" />
            </svg>
          </div>

          <p className="font-medium text-gray-700">
            Click to upload or drag & drop
          </p>

          <p className="text-xs text-gray-500">
            PNG, JPG, or PDF (max. 5MB)
            {required && (
              <span className="font-semibold text-red-500"> • Required</span>
            )}
          </p>
        </div>
      </label>

      {file && (
        <div className="mt-3 flex items-center justify-between rounded-md border border-gray-200 bg-white px-3 py-2 text-sm">
          <span className="truncate max-w-[70%]">{file.name}</span>
          <button
            type="button"
            onClick={onRemove}
            className="text-gray-600 hover:text-gray-900"
          >
            Remove
          </button>
        </div>
      )}

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
    </div>
  );
}
