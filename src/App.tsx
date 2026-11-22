import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import RouteFallback from "./components/RouteFallback";

// The /resume route carries the heavy 3D libraries, so it is code-split and
// only downloaded when a visitor actually goes there.
const ResumePage = lazy(() => import("./pages/ResumePage"));

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route
        path="/resume"
        element={
          <Suspense fallback={<RouteFallback label="Loading the railway…" />}>
            <ResumePage />
          </Suspense>
        }
      />
      {/* Unknown routes fall back to home rather than a dead end. */}
      <Route path="*" element={<HomePage />} />
    </Routes>
  );
}
