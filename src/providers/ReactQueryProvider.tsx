// src/providers/ReactQueryProvider.tsx
"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

export default function ReactQueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Initialize QueryClient - ensures client is only created once per render
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Default staleTime: 5 minutes (adjust as needed)
            // Data is considered fresh for this duration
            staleTime: 1000 * 60 * 5,
            // Default gcTime (cacheTime): 5 minutes (adjust as needed)
            // Data stays in cache for this duration after component unmounts
            gcTime: 1000 * 60 * 5,
            // Refetch on window focus - good default for keeping data fresh
            refetchOnWindowFocus: true,
            // Retry failed requests (default 3 times)
            retry: 1, // Let's retry once for this example
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Add DevTools for development environments */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
