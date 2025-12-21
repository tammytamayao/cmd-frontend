"use client";

import { useCallback, useState } from "react";

type ConfirmOptions = {
  title?: string;
  description?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  confirmTone?: "primary" | "danger";
};

export function useConfirm() {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions>({});
  const [resolver, setResolver] = useState<((v: boolean) => void) | null>(null);

  const confirm = useCallback((opts: ConfirmOptions) => {
    setOptions(opts);
    setOpen(true);

    return new Promise<boolean>((resolve) => {
      setResolver(() => resolve);
    });
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    if (resolver) resolver(false);
    setResolver(null);
  }, [resolver]);

  const accept = useCallback(() => {
    setOpen(false);
    if (resolver) resolver(true);
    setResolver(null);
  }, [resolver]);

  return { open, options, confirm, close, accept };
}
