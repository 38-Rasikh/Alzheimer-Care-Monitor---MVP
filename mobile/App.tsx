import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { PaperProvider } from 'react-native-paper';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { RootNavigator } from './src/navigation/RootNavigator';
import { AuthProvider } from './src/state/AuthContext';
import { ErrorBoundary } from './src/components/common/ErrorBoundary';
import { useNotifications } from './src/hooks/useNotifications';
import { theme } from './src/theme';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 30000,
    },
  },
});

function NavigationContent() {
  // Initialize notifications INSIDE NavigationContainer
  useNotifications();

  return (
    <>
      <RootNavigator />
      <StatusBar style="auto" />
    </>
  );
}

function AppContent() {
  return (
    <NavigationContainer>
      <NavigationContent />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <PaperProvider theme={theme}>
            <AppContent />
          </PaperProvider>
        </QueryClientProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
