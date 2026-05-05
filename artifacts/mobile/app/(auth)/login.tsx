import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

export default function LoginScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { login } = useAuth();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!identifier.trim() || !password) {
      setError("Please fill in all fields.");
      return;
    }
    setError("");
    setLoading(true);
    const result = await login(identifier, password);
    setLoading(false);
    if (result.success) {
      router.replace("/(tabs)");
    } else {
      setError(result.error ?? "Login failed.");
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={["#00251A", "#004D40", "#00695C"]}
        style={[styles.header, { paddingTop: insets.top + 32 }]}
      >
        <View style={styles.logoMark}>
          <Text style={styles.logoEmoji}>♻</Text>
        </View>
        <Text style={styles.appName}>binGO</Text>
        <Text style={styles.tagline}>Welcome back, eco-warrior</Text>
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={[
            styles.formContainer,
            { paddingBottom: insets.bottom + 40 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.formTitle, { color: colors.foreground }]}>
            Sign In
          </Text>

          {!!error && (
            <View style={[styles.errorBox, { backgroundColor: "#FFEBEE" }]}>
              <Feather name="alert-circle" size={15} color="#C62828" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <Text style={[styles.label, { color: colors.mutedForeground }]}>
            USN or Email
          </Text>
          <View style={[styles.inputWrap, { borderColor: colors.border, backgroundColor: colors.input }]}>
            <Feather name="user" size={17} color={colors.mutedForeground} />
            <TextInput
              style={[styles.input, { color: colors.foreground }]}
              placeholder="1BM22CS001 or email"
              placeholderTextColor={colors.mutedForeground}
              value={identifier}
              onChangeText={setIdentifier}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <Text style={[styles.label, { color: colors.mutedForeground }]}>
            Password
          </Text>
          <View style={[styles.inputWrap, { borderColor: colors.border, backgroundColor: colors.input }]}>
            <Feather name="lock" size={17} color={colors.mutedForeground} />
            <TextInput
              style={[styles.input, { color: colors.foreground }]}
              placeholder="Password"
              placeholderTextColor={colors.mutedForeground}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Feather
                name={showPassword ? "eye-off" : "eye"}
                size={17}
                color={colors.mutedForeground}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.submitBtn, { backgroundColor: colors.primary }]}
            onPress={handleLogin}
            activeOpacity={0.85}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitBtnText}>Sign In</Text>
            )}
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.mutedForeground }]}>
              New to binGO?{" "}
            </Text>
            <TouchableOpacity onPress={() => router.push("/(auth)/signup")}>
              <Text style={[styles.footerLink, { color: colors.primary }]}>
                Create Account
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  header: {
    alignItems: "center",
    paddingBottom: 44,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
  },
  logoMark: {
    width: 68,
    height: 68,
    borderRadius: 22,
    backgroundColor: "rgba(167,255,235,0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: "rgba(167,255,235,0.25)",
  },
  logoEmoji: {
    fontSize: 36,
  },
  appName: {
    fontSize: 42,
    fontFamily: "Outfit_800ExtraBold",
    color: "#FFFFFF",
    letterSpacing: -1,
  },
  tagline: {
    fontSize: 14,
    fontFamily: "Outfit_400Regular",
    color: "rgba(255,255,255,0.6)",
    marginTop: 4,
  },
  formContainer: {
    paddingHorizontal: 28,
    paddingTop: 36,
  },
  formTitle: {
    fontSize: 28,
    fontFamily: "Outfit_700Bold",
    marginBottom: 24,
    letterSpacing: -0.5,
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 14,
    borderRadius: 14,
    marginBottom: 16,
  },
  errorText: {
    color: "#C62828",
    fontSize: 13,
    fontFamily: "Outfit_500Medium",
    flex: 1,
  },
  label: {
    fontSize: 13,
    fontFamily: "Outfit_600SemiBold",
    marginBottom: 8,
    marginTop: 4,
    letterSpacing: 0.2,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1.5,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 15,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Outfit_400Regular",
  },
  submitBtn: {
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 24,
  },
  submitBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Outfit_700Bold",
    letterSpacing: 0.3,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  footerText: {
    fontSize: 14,
    fontFamily: "Outfit_400Regular",
  },
  footerLink: {
    fontSize: 14,
    fontFamily: "Outfit_700Bold",
  },
});
