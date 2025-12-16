"use client";

import { useCallback, useMemo, useState } from "react";

export function useReceiptUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const accept = useMemo(
    () => ["image/png", "image/jpeg", "application/pdf"],
    []
  );
  const maxBytes = 5 * 1024 * 1024;

  const onFiles = useCallback(
    (files: FileList | null) => {
      setUploadError(null);
      if (!files || files.length === 0) return;

      const f = files[0];

      if (!accept.includes(f.type)) {
        setUploadError("Only PNG, JPG, or PDF files are allowed.");
        return;
      }

      if (f.size > maxBytes) {
        setUploadError("File is larger than 5MB.");
        return;
      }

      setFile(f);
    },
    [accept, maxBytes]
  );

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLLabelElement>) => {
      e.preventDefault();
      onFiles(e.dataTransfer.files);
    },
    [onFiles]
  );

  return {
    file,
    setFile,
    uploadError,
    setUploadError,
    accept,
    onFiles,
    onDrop,
  };
}
