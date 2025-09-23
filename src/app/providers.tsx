"use client";

import { useState } from "react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { store, persistor } from "../store";
import { SessionProvider } from "next-auth/react";
import { CustomSessionProvider } from "./SessionProvider";
import { NotificationProvider } from "@/src/contexts/NotificationContext";
import { AISocketProvider } from "@/src/contexts/AISocketProvider";

interface ProvidersProps {
  children: React.ReactNode;
  session?: any;
}

export function Providers({ children, session }: ProvidersProps) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        refetchOnWindowFocus: false,
      },
    },
  }));

  return (
    <SessionProvider session={session}>
      <CustomSessionProvider session={session}>
        <QueryClientProvider client={queryClient}>
          <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
              <NotificationProvider>
                <AISocketProvider>
                  {children}
                </AISocketProvider>
              </NotificationProvider>
            </PersistGate>
          </Provider>
        </QueryClientProvider>
      </CustomSessionProvider>
    </SessionProvider>
  );
}
