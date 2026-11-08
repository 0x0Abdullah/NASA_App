import { useEffect, useRef, useState } from "react";

/**
 * Renders children only once the wrapper approaches the viewport.
 * Combined with React.lazy(), this defers heavy imports (three.js scenes)
 * until the user is actually scrolling toward them.
 */
export default function LazyMount({ children, fallback = null, rootMargin = "800px" }) {
  const ref = useRef(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setNear(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin]);

  return (
    <div ref={ref} aria-busy={!near}>
      {near ? children : fallback}
    </div>
  );
}
