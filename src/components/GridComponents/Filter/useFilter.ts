import { useCallback, useEffect, useRef, useState } from 'react';

const useFilter = () => {
  const [open, setOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(event: MouseEvent) {
      if (
        filterRef.current &&
        !filterRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const onClickFilter = useCallback(() => {
    setOpen((prev) => !prev);
  }, []);

  return {
    open,
    filterRef,
    onClickFilter,
  };
};

export default useFilter;
