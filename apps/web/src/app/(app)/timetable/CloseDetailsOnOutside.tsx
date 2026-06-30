'use client';

import { useEffect } from 'react';

export function CloseDetailsOnOutside() {
  useEffect(() => {
    function closeOpenDetails(target: EventTarget | null) {
      document.querySelectorAll<HTMLDetailsElement>('details[data-close-outside][open]').forEach((details) => {
        if (target instanceof Node && details.contains(target)) return;
        details.open = false;
      });
    }

    function onPointerDown(event: PointerEvent) {
      closeOpenDetails(event.target);
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') closeOpenDetails(null);
    }

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  return null;
}
