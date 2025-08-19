import { useEffect, useState } from 'react';

export function useContainerWidth<T extends HTMLElement>(
  ref: React.RefObject<T | null>,
) {
  const [width, setWidth] = useState<number | null>(null);
  useEffect(() => {
    function update() {
      if (ref.current) setWidth(ref.current.clientWidth);
    }
    update();
    const ro = new ResizeObserver(update);
    if (ref.current) ro.observe(ref.current);
    return () => ro.disconnect();
  }, [ref]);
  return width;
}
