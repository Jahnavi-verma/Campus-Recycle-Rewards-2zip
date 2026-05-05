import { Redirect } from "expo-router";

import { useAuth } from "@/context/AuthContext";

export default function Index() {
  const { user, hasSeenOnboarding, isLoading } = useAuth();

  if (isLoading) return null;

  if (!hasSeenOnboarding) {
    return <Redirect href="/onboarding" />;
  }

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  return <Redirect href="/(tabs)" />;
}
