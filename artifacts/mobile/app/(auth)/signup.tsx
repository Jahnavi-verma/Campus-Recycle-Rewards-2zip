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
      setError("Please fill in all fields.");
      return;
    }
    if (!email.toLowerCase().trim().endsWith("@bmsce.ac.in")) {
      setError("Only @bmsce.ac.in email addresses are allowed.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setError("");
    setLoading(true);
    const result = await signup(name, email, usn, password);
    setLoading(false);

    if (result.success) {
      router.replace("/(tabs)");
    } else {
      setError(result.error ?? "Signup failed.");
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={["#00251A", "#004D40", "#00695C"]}
        style={[styles.header, { paddingTop: insets.top + 20 }]}
      >
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.appName}>Create Account</Text>
        <Text style={styles.tagline}>Join the BMSCE Green Movement</Text>
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
            <View style={[styles.errorBox, { backgroundColor: "#FFEBEE" }]}>
              <Feather name="alert-circle" size={15} color="#C62828" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <Field label="Full Name" icon="user">
            <TextInput
              style={[styles.input, { color: colors.foreground }]}
              placeholder="e.g. Arjun Sharma"
              placeholderTextColor={colors.mutedForeground}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          </Field>

          <Field label="College Email" icon="mail">
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
              placeholder="e.g. 1BM22CS001"
              placeholderTextColor={colors.mutedForeground}
              value={usn}
              onChangeText={(t) => setUsn(t.toUpperCase())}
              autoCapitalize="characters"
              autoCorrect={false}
            />
          </Field>

          <Field label="Password" icon="lock">
            <TextInput
              style={[styles.input, { color: colors.foreground }]}
              placeholder="Min. 6 characters"
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
          </Field>

          <Field label="Confirm Password" icon="lock">
            <TextInput
              style={[styles.input, { color: colors.foreground }]}
              placeholder="Re-enter password"
              placeholderTextColor={colors.mutedForeground}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showPassword}
            />
          </Field>

          <View style={[styles.noteBox, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
            <Feather name="info" size={14} color={colors.primary} />
            <Text style={[styles.noteText, { color: colors.mutedForeground }]}>
              Only BMSCE students with a @bmsce.ac.in email can register. Your USN must be unique.
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
              <Text style={styles.submitBtnText}>Create Account</Text>
            )}
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.mutedForeground }]}>
              Already have an account?{" "}
            </Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={[styles.footerLink, { color: colors.primary }]}>
                Sign In
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function Field({
  label,
  icon,
  children,
}: {
  label: string;
  icon: React.ComponentProps<typeof Feather>["name"];
  children: React.ReactNode;
}) {
  const colors = useColors();
  return (
    <View style={styles.fieldWrap}>
      <Text style={[styles.label, { color: colors.mutedForeground }]}>{label}</Text>
      <View style={[styles.inputWrap, { borderColor: colors.border, backgroundColor: colors.input }]}>
        <Feather name={icon} size={17} color={colors.mutedForeground} />
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  header: {
    paddingBottom: 32,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
  },
  backBtn: {
    marginBottom: 16,
    alignSelf: "flex-start",
  },
  appName: {
    fontSize: 30,
    fontFamily: "Outfit_700Bold",
    color: "#FFFFFF",
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 14,
    fontFamily: "Outfit_400Regular",
    color: "rgba(255,255,255,0.6)",
    marginTop: 4,
  },
  formContainer: {
    paddingHorizontal: 28,
    paddingTop: 28,
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "flex-start",
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
  fieldWrap: { marginBottom: 4 },
  label: {
    fontSize: 13,
    fontFamily: "Outfit_600SemiBold",
    marginBottom: 8,
    marginTop: 8,
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
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Outfit_400Regular",
  },
  noteBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 12,
    marginBottom: 4,
  },
  noteText: {
    fontSize: 12,
    fontFamily: "Outfit_400Regular",
    flex: 1,
    lineHeight: 18,
  },
  submitBtn: {
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: "center",
    marginTop: 20,
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
