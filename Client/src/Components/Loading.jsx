import React from "react";

// Plain, side-effect-free spinner. This is what Suspense shows while a
// lazy-loaded route chunk is still downloading (e.g. on a hard reload of
// /seller, /cart, /checkout, etc). It must NOT navigate anywhere — it
// used to redirect to "/" on mount, which meant any hard reload of a
// lazy route got bounced straight back to home before the real page's
// chunk even finished loading.
function Loading() {
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-24 w-24 border-4 border-gray-300 border-t-primary"></div>
    </div>
  );
}

export default Loading;
