import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { t, tb } from "../i18n/u"; // ✅ bilingual translation helper

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "hi", label: "हिन्दी (Hindi)" },
  { code: "te", label: "తెలుగు (Telugu)" },
  { code: "bn", label: "বাংলা (Bengali)" },
  { code: "zh", label: "中文 (Chinese)" },
  { code: "ja", label: "日本語 (Japanese)" },
  { code: "fr", label: "Français" },
];

const COLORS = {
  primary: "#4EB1B8", // Teal
  secondary: "#FF8A65", // Coral
  background: "#F9F9F9",
  textDark: "#1A1A1A",
  white: "#FFFFFF",
  red: "#D32F2F", // SOS
  redDark: "#B71C1C",
};

export default function WelcomeScreen({ navigation }) {
  const [selected, setSelected] = useState("en");

  return (
    <LinearGradient
      colors={["#FF8A65", "#4EB1B8"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.background}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.headerBox}>
          <Text style={styles.title}>
            {tb(selected, "welcomeTitle", "One-stop-Story")}
          </Text>
          <Text style={styles.subtitle}>
            {tb(
              selected,
              "welcomeSubtitle",
              "Tell your story once. You control what's shared."
            )}
          </Text>
        </View>

        {/* Language selection card */}
        <View style={styles.card}>
          <Text style={styles.label}>
            {tb(selected, "selectLanguage", "Select Language")}
          </Text>

          <ScrollView
            style={{ width: "100%", maxHeight: 300 }}
            contentContainerStyle={{ paddingBottom: 8 }}
          >
            {LANGUAGES.map((item) => (
              <TouchableOpacity
                key={item.code}
                onPress={() => setSelected(item.code)}
                style={[
                  styles.row,
                  selected === item.code && styles.rowSelected,
                ]}
                accessibilityRole="radio"
                accessibilityState={{ selected: selected === item.code }}
              >
                <View
                  style={[
                    styles.radio,
                    selected === item.code && styles.radioOn,
                  ]}
                />
                <Text
                  style={[
                    styles.rowText,
                    selected === item.code && styles.rowTextSelected,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Continue Button */}
          <View style={{ marginTop: 20, alignItems: "center" }}>
            <TouchableOpacity
              style={styles.btn}
              onPress={() => navigation.navigate("Intake", { lang: selected })}
            >
              <Text style={styles.btnText}>{tb(selected, "continue", "Continue")}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Big SOS button (prototype only; disabled) */}
        <View style={styles.sosWrap}>
          <TouchableOpacity
            style={styles.sosBtn}
            activeOpacity={1}
            disabled
            accessibilityRole="button"
            accessibilityLabel="SOS (prototype)"
            accessibilityHint="Emergency button is disabled in prototype"
          >
            <MaterialCommunityIcons name="alert" size={24} color={COLORS.white} />
            <Text style={styles.sosText}>SOS</Text>
            <Text style={styles.sosSub}>Emergency (prototype)</Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  headerBox: { alignItems: "center", marginBottom: 20 },
  title: {
    fontSize: 30,
    fontWeight: "800",
    color: COLORS.white,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#F2FDFE",
    textAlign: "center",
    marginTop: 6,
  },
  card: {
    width: "100%",
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 10,
    elevation: 4,
  },
  label: {
    fontWeight: "700",
    fontSize: 16,
    marginBottom: 10,
    color: COLORS.textDark,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: "#fff",
  },
  rowSelected: { borderColor: COLORS.primary, backgroundColor: "#E0F7FA" },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#999",
    marginRight: 10,
  },
  radioOn: { borderColor: COLORS.primary, backgroundColor: COLORS.primary },
  rowText: { fontSize: 16, color: COLORS.textDark },
  rowTextSelected: { fontWeight: "700", color: COLORS.primary },
  btn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 30,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 18 },

  // SOS styles
  sosWrap: {
    width: "100%",
    paddingHorizontal: 10,
    marginTop: 24,
  },
  sosBtn: {
    backgroundColor: COLORS.red,
    borderRadius: 20,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
  sosText: {
    color: COLORS.white,
    fontWeight: "900",
    fontSize: 22,
    marginTop: 6,
  },
  sosSub: {
    color: "#FFE5E5",
    fontSize: 12,
    marginTop: 2,
  },
});
