"use client";

import { ThemeProvider } from "next-themes";
import { StoreProvider } from "./store-provider";
import { QueryProvider } from "./query-provider";
import { AuthProvider } from "./auth-provider";

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <StoreProvider>
        <AuthProvider>
          <QueryProvider>{children}</QueryProvider>
        </AuthProvider>
      </StoreProvider>
    </ThemeProvider>
  );
};
