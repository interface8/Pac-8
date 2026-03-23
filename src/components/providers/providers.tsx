"use client";

import { StoreProvider } from "./store-provider";
import { QueryProvider } from "./query-provider";
import { AuthProvider } from "./auth-provider";

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <StoreProvider>
      <AuthProvider>
        <QueryProvider>{children}</QueryProvider>
      </AuthProvider>
    </StoreProvider>
  );
};
