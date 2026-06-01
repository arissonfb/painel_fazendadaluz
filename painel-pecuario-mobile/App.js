import "react-native-gesture-handler";
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { enableScreens } from "react-native-screens";
import { StatusBar } from "expo-status-bar";
import { View, ActivityIndicator, StyleSheet, Text, ScrollView } from "react-native";

import { AuthProvider, useAuth } from "./src/context/AuthContext";
import { DataProvider } from "./src/context/DataContext";
import Navigator from "./src/navigation/Navigator";
import LoginScreen from "./src/screens/LoginScreen";
import { colors } from "./src/theme";

enableScreens(true);

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return (
        <ScrollView contentContainerStyle={styles.errorContainer}>
          <Text style={styles.errorTitle}>Erro no app</Text>
          <Text style={styles.errorMsg}>{String(this.state.error)}</Text>
          <Text style={styles.errorStack}>{this.state.error?.stack}</Text>
        </ScrollView>
      );
    }
    return this.props.children;
  }
}

function Root() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  return (
    <DataProvider>
      <NavigationContainer>
        <Navigator />
      </NavigationContainer>
    </DataProvider>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={styles.flex}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <ErrorBoundary>
          <AuthProvider>
            <Root />
          </AuthProvider>
        </ErrorBoundary>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  errorContainer: {
    flexGrow: 1,
    padding: 24,
    backgroundColor: "#fff1f0",
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#c0392b",
    marginBottom: 12,
    marginTop: 48,
  },
  errorMsg: {
    fontSize: 14,
    color: "#c0392b",
    marginBottom: 16,
    fontWeight: "600",
  },
  errorStack: {
    fontSize: 11,
    color: "#555",
    fontFamily: "monospace",
  },
});
