import "./RouteFallback.css";

/** Lightweight loading screen shown while a lazy route chunk downloads. */
export default function RouteFallback({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="route-fallback" role="status" aria-live="polite">
      <div className="route-fallback__mark" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <p>{label}</p>
    </div>
  );
}
