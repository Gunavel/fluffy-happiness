import { lazy, Suspense } from "react";

const LazyComp = lazy(() => import("./context-component"));
const Loading = <div>Loading...</div>;

<Suspense fallback={Loading}>
  <LazyComp />
</Suspense>;
