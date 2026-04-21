import React, { useState, useRef } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, KeyboardAvoidingView, Platform,
  ScrollView, Animated, Image, StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { colors, spacing, radius, shadow } from "../theme";

export default function LoginScreen() {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const passwordRef = useRef(null);
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1, duration: 600, useNativeDriver: true,
    }).start();
  }, []);

  function shake() {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -6, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 40, useNativeDriver: true }),
    ]).start();
  }

  async function handleLogin() {
    const u = username.trim();
    const p = password;
    if (!u || !p) {
      setError("Informe o login e a senha.");
      shake();
      return;
    }
    setError("");
    setLoading(true);
    try {
      await login(u, p);
    } catch (err) {
      setError(err.message || "Login ou senha incorretos.");
      shake();
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primaryDark} />

      {/* Fundo com camadas decorativas */}
      <View style={styles.bgTop} />
      <View style={styles.bgCircle1} />
      <View style={styles.bgCircle2} />

      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Brand */}
            <Animated.View style={[styles.brand, { opacity: fadeAnim }]}>
              <View style={styles.logoWrap}>
                <Image
                  source={require("../../assets/icon.png")}
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.brandTitle}>Fazendas Da Luz</Text>
              <Text style={styles.brandSub}>Painel de Gestão Pecuária</Text>
            </Animated.View>

            {/* Card */}
            <Animated.View
              style={[
                styles.card,
                { opacity: fadeAnim, transform: [{ translateX: shakeAnim }] },
              ]}
            >
              <Text style={styles.cardTitle}>Bem-vindo</Text>
              <Text style={styles.cardSub}>Entre com suas credenciais de acesso</Text>

              {/* Campo Login */}
              <View style={styles.field}>
                <Text style={styles.label}>Login</Text>
                <View style={[styles.inputRow, username ? styles.inputRowActive : null]}>
                  <View style={styles.inputIconWrap}>
                    <Ionicons name="person" size={17} color={username ? colors.primary : colors.textLight} />
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="Digite seu login"
                    placeholderTextColor={colors.textLight}
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="next"
                    onSubmitEditing={() => passwordRef.current?.focus()}
                  />
                </View>
              </View>

              {/* Campo Senha */}
              <View style={styles.field}>
                <Text style={styles.label}>Senha</Text>
                <View style={[styles.inputRow, password ? styles.inputRowActive : null]}>
                  <View style={styles.inputIconWrap}>
                    <Ionicons name="lock-closed" size={17} color={password ? colors.primary : colors.textLight} />
                  </View>
                  <TextInput
                    ref={passwordRef}
                    style={[styles.input, { flex: 1 }]}
                    placeholder="Digite sua senha"
                    placeholderTextColor={colors.textLight}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPass}
                    returnKeyType="done"
                    onSubmitEditing={handleLogin}
                  />
                  <TouchableOpacity onPress={() => setShowPass(!showPass)} style={styles.eyeBtn}>
                    <Ionicons
                      name={showPass ? "eye" : "eye-off"}
                      size={18}
                      color={colors.textLight}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Erro */}
              {error ? (
                <View style={styles.errorBox}>
                  <Ionicons name="alert-circle" size={15} color={colors.danger} />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              {/* Botão */}
              <TouchableOpacity
                style={[styles.btn, loading && styles.btnDisabled]}
                onPress={handleLogin}
                disabled={loading}
                activeOpacity={0.88}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <View style={styles.btnInner}>
                    <Text style={styles.btnText}>Entrar</Text>
                    <View style={styles.btnArrow}>
                      <Ionicons name="arrow-forward" size={16} color={colors.primary} />
                    </View>
                  </View>
                )}
              </TouchableOpacity>

              {/* Dica */}
              <View style={styles.hint}>
                <Ionicons name="information-circle-outline" size={14} color={colors.textLight} />
                <Text style={styles.hintText}>
                  Use o mesmo login do sistema web
                </Text>
              </View>
            </Animated.View>

            <Text style={styles.footer}>Fazendas Da Luz © {new Date().getFullYear()}</Text>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.primaryDark },
  bgTop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.primary,
    bottom: "55%",
  },
  bgCircle1: {
    position: "absolute",
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: colors.primaryLight,
    opacity: 0.25,
    top: -80,
    right: -80,
  },
  bgCircle2: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: colors.primaryDark,
    opacity: 0.3,
    top: 60,
    left: -60,
  },
  safe: { flex: 1 },
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },

  brand: { alignItems: "center", marginBottom: 32 },
  logoWrap: {
    width: 90,
    height: 90,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.25)",
    overflow: "hidden",
    ...shadow.md,
  },
  logo: { width: 70, height: 70 },
  brandTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  brandSub: {
    fontSize: 14,
    color: "rgba(255,255,255,0.65)",
    fontWeight: "500",
    letterSpacing: 0.2,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 28,
    ...shadow.lg,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.text,
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  cardSub: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 24,
  },

  field: { marginBottom: 16 },
  label: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textSecondary,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 12,
    height: 52,
    paddingRight: 12,
  },
  inputRowActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryFaded,
  },
  inputIconWrap: {
    width: 44,
    alignItems: "center",
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
    height: "100%",
  },
  eyeBtn: { padding: 6 },

  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.dangerFaded,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: "#f5d4cc",
  },
  errorText: { fontSize: 13, color: colors.danger, flex: 1, fontWeight: "500" },

  btn: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    height: 54,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
    ...shadow.md,
  },
  btnDisabled: { opacity: 0.65 },
  btnInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  btnText: { fontSize: 16, fontWeight: "700", color: "#fff", letterSpacing: 0.2 },
  btnArrow: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },

  hint: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    marginTop: 16,
  },
  hintText: { fontSize: 12, color: colors.textLight },

  footer: {
    textAlign: "center",
    color: "rgba(255,255,255,0.4)",
    fontSize: 12,
    marginTop: 32,
  },
});
