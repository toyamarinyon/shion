import { useEffect } from "react";

type ScrollHandlerOptions = {
  container: React.RefObject<HTMLDivElement>;
  onScrollUpward?: () => void;
  onContainerScrollToBottom?: () => void;
};
export const useScrollHandler = ({
  onScrollUpward,
  onContainerScrollToBottom,
  container,
}: ScrollHandlerOptions) => {
  useEffect(() => {
    const threshold = 50;
    let lastScrollY = container.current?.scrollTop || 0;
    let ticking = false;

    const updateScrollDir = () => {
      const scrollY = container.current?.scrollTop || 0;
      if (Math.abs(scrollY - lastScrollY) < threshold) {
        return;
      }
      if (scrollY < lastScrollY && onScrollUpward) {
        onScrollUpward();
      }
      lastScrollY = scrollY > 0 ? scrollY : 0;
    };

    const checkContainerScrollToBottom = () => {
      const containerHeight =
        container.current?.getBoundingClientRect().height || 0;
      const scrollTop = container.current?.scrollTop || 0;
      const scrollHeight = container.current?.scrollHeight || 0;

      if (containerHeight + scrollTop === scrollHeight) {
        onContainerScrollToBottom?.();
      }
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          updateScrollDir();
          checkContainerScrollToBottom();
          ticking = false;
        });
        ticking = true;
      }
    };

    container.current?.addEventListener("scroll", onScroll);

    return () => {
      container.current?.removeEventListener("scroll", onScroll);
    };
  }, [onScrollUpward, onContainerScrollToBottom, container]);
};
