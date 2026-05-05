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

export default function SignupScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { signup } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [usn, setUsn] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!name.trim() || !email.trim() || !usn.trim() || !password || !confirmPassword) {
      setError("all fields required.");
      return;
    }
    if (!email.toLowerCase().trim().endsWith("@bmsce.ac.in")) {
      setError("only @bmsce.ac.in emails, sorry.");
      return;
    }
    if (password !== confirmPassword) {
      setError("passwords don't match.");
      return;
    }
    if (password.length < 6) {
      setError("password needs to be at least 6 characters.");
      return;
    }

    setError("");
    setLoading(true);
    const result = await signup(name, email, usn, password);
    setLoading(false);

    if (result.success) {
      router.replace("/(tabs)");
    } else {
      setError(result.error ?? "signup failed. try again?");
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={["#09090B", "#1E1B4B"]}
        style={[styles.header, { paddingTop: insets.top + 16 }]}
      >
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color="rgba(255,255,255,0.7)" />
        </TouchableOpacity>
        <Text style={styles.appName}>join binGO</Text>
        <Text style={styles.tagline}>bmsce students only 🌿</Text>
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
          {!!error && (
            <View style={[styles.errorBox, { backgroundColor: "#FEF2F2", borderColor: "#FECACA" }]}>
              <Feather name="alert-circle" size={14} color="#DC2626" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <Field label="your name" icon="user">
            <TextInput
              style={[styles.input, { color: colors.foreground }]}
              placeholder="e.g. Priya Sharma"
              placeholderTextColor={colors.mutedForeground}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          </Field>

          <Field label="college email" icon="mail">
            <TextInput
              style={[styles.input, { color: colors.foreground }]}
              placeholder="yourname@bmsce.ac.in"
              placeholderTextColor={colors.mutedForeground}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoCorrect={false}
            />
          </Field>

          <Field label="USN" icon="credit-card">
            <TextInput
              style={[styles.input, { color: colors.foreground }]}
              placeholder="1BM22CS001"
              placeholderTextColor={colors.mutedForeground}
              value={usn}
              onChangeText={(t) => setUsn(t.toUpperCase())}
              autoCapitalize="characters"
              autoCorrect={false}
            />
          </Field>

          <Field label="password" icon="lock">
            <TextInput
              style={[styles.input, { color: colors.foreground }]}
              placeholder="at least 6 characters"
              placeholderTextColor={colors.mutedForeground}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Feather name={showPassword ? "eye-off" : "eye"} size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          </Field>

          <Field label="confirm password" icon="lock">
            <TextInput
              style={[styles.input, { color: colors.foreground }]}
              placeholder="same thing again"
              placeholderTextColor={colors.mutedForeground}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showPassword}
            />
          </Field>

          <View style={[styles.noteBox, { backgroundColor: colors.muted }]}>
            <Text style={[styles.noteText, { color: colors.mutedForeground }]}>
              🔒 USN must be unique. Only @bmsce.ac.in emails work.
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.submitBtn, { backgroundColor: colors.primary }]}
            onPress={handleSignup}
            activeOpacity={0.85}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitBtnText}>create account →</Text>
            )}
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.mutedForeground }]}>already in? </Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={[styles.footerLink, { color: colors.primary }]}>sign in</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function Field({ label, icon, children }: {
  label: string;
  icon: React.ComponentProps<typeof Feather>["name"];
  children: React.ReactNode;
}) {
  const colors = useColors();
  return (
    <View style={{ marginBottom: 4 }}>
      <Text style={[styles.label, { color: colors.mutedForeground }]}>{label}</Text>
      <View style={[styles.inputWrap, { borderColor: colors.border, backgroundColor: colors.input }]}>
        <Feather name={icon} size={16} color={colors.mutedForeground} />
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  header: {
    paddingBottom: 28,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  backBtn: { marginBottom: 14, alignSelf: "flex-start" },
  appName: {
    fontSize: 32,
    fontFamily: "Outfit_800ExtraBold",
    color: "#FFFFFF",
    letterSpacing: -1,
  },
  tagline: {
    fontSize: 14,
    fontFamily: "Outfit_400Regular",
    color: "rgba(255,255,255,0.55)",
    marginTop: 4,
  },
  formContainer: { paddingHorizontal: 28, paddingTop: 28 },
  errorBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  errorText: {
    color: "#DC2626",
    fontSize: 13,
    fontFamily: "Outfit_400Regular",
    flex: 1,
  },
  label: {
    fontSize: 12,
    fontFamily: "Outfit_600SemiBold",
    marginBottom: 8,
    marginTop: 10,
    textTransform: "lowercase",
    letterSpacing: 0.3,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 15,
  },
  input: { flex: 1, fontSize: 15, fontFamily: "Outfit_400Regular" },
  noteBox: {
    padding: 14,
    borderRadius: 12,
    marginTop: 12,
    marginBottom: 4,
  },
  noteText: { fontSize: 13, fontFamily: "Outfit_400Regular", lineHeight: 20 },
  submitBtn: {
    borderRadius: 16,
    paddingVertical: 17,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 24,
  },
  submitBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Outfit_700Bold",
  },
  footer: { flexDirection: "row", justifyContent: "center", alignItems: "center" },
  footerText: { fontSize: 14, fontFamily: "Outfit_400Regular" },
  footerLink: { fontSize: 14, fontFamily: "Outfit_600SemiBold" },
});
