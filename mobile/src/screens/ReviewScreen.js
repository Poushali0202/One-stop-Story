// mobile/src/screens/ReviewScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { COLORS } from "../theme/colors";
import { t, tb } from "../i18n/u"; // safe i18n helpers
import { LinearGradient } from "expo-linear-gradient";

export default function ReviewScreen({ route, navigation }) {
  const mapping = route.params?.mapping || {};
  const initial = mapping?.schema || {};
  const { language: langParam = "en" } = route.params || {};
  const lang = initial.language || langParam || "en";

  const [language, setLanguage] = useState(lang);
  const [sleeping, setSleeping] = useState(initial.current_status?.sleeping || "");
  const [nights, setNights] = useState(
    initial.current_status?.nights !== undefined && initial.current_status?.nights !== null
      ? String(initial.current_status?.nights)
      : ""
  );
  const [needs, setNeeds] = useState(
    (initial.needs || []).map((n) => n.value || n).join(", ")
  );
  const [risks, setRisks] = useState(
    (initial.risks || []).map((r) => r.value || r).join(", ")
  );
  const [phone, setPhone] = useState(initial.contact?.phone || initial.contact_phone || "");

  const onNext = () => {
    const schema = {
      language,
      current_status: { sleeping, nights: Number(nights || 0) },
      needs: needs
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .map((v) => ({ value: v })),
      risks: risks
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .map((v) => ({ value: v })),
      contact: phone ? { phone } : undefined,
      contact_phone: phone || undefined,
    };
    navigation.navigate("Consent", { mapping: { schema }, lang: language });
  };

  return (
  <LinearGradient
      colors={["#FF8A65", "#4EB1B8"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }} 
     >
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={styles.container}
    >
      <View style={styles.card}>
        <Text style={styles.header}>
          {tb(lang, "reviewEdit", "Review & Edit")}
        </Text>
        <Text style={styles.sub}>
          {tb(
            lang,
            "welcomeSubtitle",
            "Tell your story once. You control what's shared."
          )}
        </Text>

        {/* Language */}
        <View style={styles.section}>
          <Text style={styles.label}>{tb(lang, "language", "Language")}</Text>
          <TextInput style={styles.input} value={language} onChangeText={setLanguage} />
        </View>

        {/* Current sleeping place */}
        <View style={styles.section}>
          <Text style={styles.label}>
            {tb(lang, "sleepingPlace", "Current Sleeping")}
          </Text>
          <TextInput
            style={styles.input}
            value={sleeping}
            onChangeText={setSleeping}
            placeholder="e.g., car, street, shelter"
          />
        </View>

        {/* Nights */}
        <View style={styles.section}>
          <Text style={styles.label}>
            {tb(lang, "nightsStayed", "Nights")}
          </Text>
          <TextInput
            style={styles.input}
            value={nights}
            onChangeText={setNights}
            keyboardType="numeric"
          />
        </View>

        {/* Needs */}
        <View style={styles.section}>
          <Text style={styles.label}>{tb(lang, "needs", "Needs")}</Text>
          <TextInput
            style={styles.input}
            value={needs}
            onChangeText={setNeeds}
            placeholder="food, shelter, health..."
          />
        </View>

        {/* Risks */}
        <View style={styles.section}>
          <Text style={styles.label}>{tb(lang, "risks", "Risks")}</Text>
          <TextInput
            style={styles.input}
            value={risks}
            onChangeText={setRisks}
            placeholder="dv, medical, animals..."
          />
        </View>

        {/* Phone */}
        <View style={styles.section}>
          <Text style={styles.label}>
            {tb(lang, "contactPhone", "Your contact phone (optional)")}
          </Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            placeholder="+1XXXXXXXXXX"
          />
        </View>

        <TouchableOpacity style={styles.cta} onPress={onNext}>
          <Text style={styles.ctaText}>
            {tb(lang, "consentShare", "Consent & Share")}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", padding: 20 },
  card: {
    width: "100%",
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    fontSize: 26,
    fontWeight: "800",
    color: COLORS.primary,
    marginBottom: 4,
  },
  sub: { color: COLORS.textLight, marginBottom: 14 },
  section: { marginTop: 10 },
  label: {
    fontWeight: "600",
    color: COLORS.textDark,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 12,
    backgroundColor: COLORS.background,
    fontSize: 16,
  },
  cta: {
    marginTop: 24,
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 3,
  },
  ctaText: {
    color: COLORS.white,
    fontWeight: "700",
    fontSize: 16,
  },
});
