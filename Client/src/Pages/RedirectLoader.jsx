import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

// The old /loader behavior, kept as its own dedicated page instead of
// living inside the Suspense spinner. Visiting /loader?next=some/path
// shows a spinner for 2s then navigates to /some/path; visiting /loader
// with no `next` falls back to home after the same delay.
function RedirectLoader() {
  const navigate = useNavigate();
  const { search } = useLocation();

  const query = new URLSearchParams(search);
  const nextUrl = query.get("next");

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate(nextUrl ? `/${nextUrl}` : "/");
    }, 2000);

    return () => clearTimeout(timer);
  }, [nextUrl, navigate]);

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-24 w-24 border-4 border-gray-300 border-t-primary"></div>
    </div>
  );
}

export default RedirectLoader;
