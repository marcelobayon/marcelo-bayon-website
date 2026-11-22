import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import RouteFallback from "./components/RouteFallback";

// The /resume route carries the heavy 3D libraries, so it is code-split and
// only downloaded when a visitor actually goes there.
const ResumePage = lazy(() => import("./pages/ResumePage"));

// /engineering is a light HTML page; its 3D "interactive" sub-route is split
// out separately so three.js only loads for visitors who open the 3D model.
const EngineeringPage = lazy(() => import("./pages/EngineeringPage"));
const EngineeringInteractivePage = lazy(
  () => import("./pages/EngineeringInteractivePage"),
);

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
      <Route
        path="/engineering"
        element={
          <Suspense fallback={<RouteFallback label="Loading…" />}>
            <EngineeringPage />
          </Suspense>
        }
      />
      <Route
        path="/engineering/interactive"
        element={
          <Suspense fallback={<RouteFallback label="Loading the core…" />}>
            <EngineeringInteractivePage />
          </Suspense>
        }
      />
      {/* Unknown routes fall back to home rather than a dead end. */}
      <Route path="*" element={<HomePage />} />
    </Routes>
  );
}
