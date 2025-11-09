import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Linking,
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { api } from "../api/client";
import { t, tb } from "../i18n/u"; // ✅ bilingual helper
import { LinearGradient } from "expo-linear-gradient";

const COLORS = {
  primary: "#4EB1B8",
  secondary: "#FF8A65",
  success: "#4CAF50",
  background: "#F9F9F9",
  white: "#FFFFFF",
  textDark: "#1A1A1A",
  textLight: "#666",
};

const DEFAULT_FIELDS = [
  "language",
  "current_status.sleeping",
  "current_status.nights",
  "needs",
  "risks",
];

export default function ConsentScreen({ route, navigation }) {
  const { mapping, lang = "en" } = route.params || {};
  const schema = mapping?.schema || route.params?.schema || null;

  const [agency, setAgency] = useState("AgencyA");
  const [tokenUrl, setTokenUrl] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [fields, setFields] = useState(DEFAULT_FIELDS);

  const toggleField = (f) =>
    setFields((prev) =>
      prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]
    );

  const createConsent = async () => {
    try {
      if (!agency) return Alert.alert("Error", "Please select an agency.");
      if (!schema) return Alert.alert("Error", "Form data missing.");
      const out = await api("/consent/create", {
        method: "POST",
        body: JSON.stringify({
          agency,
          schema,
          allowedFields: fields,
          minutes: 10,
        }),
      });
      setTokenUrl(out.url);
    } catch (e) {
      Alert.alert("Consent error", String(e));
    }
  };

  const generatePdf = async () => {
    try {
      if (!agency) return Alert.alert("Error", "Please select an agency.");
      if (!schema) return Alert.alert("Error", "Form data missing.");
      const out = await api("/forms/fill", {
        method: "POST",
        body: JSON.stringify({ agency, schema }),
      });
      if (!out.artifact_url) throw new Error("No artifact URL returned.");
      setPdfUrl(out.artifact_url);
    } catch (e) {
      Alert.alert("PDF error", String(e));
    }
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
        {/* Header */}
        <Text style={styles.header}>{tb(lang, "consentShare", "Consent & Share")}</Text>
        <Text style={styles.sub}>
          {tb(
            lang,
            "welcomeSubtitle",
            "Tell your story once. You control what's shared."
          )}
        </Text>

        {/* Agency Selection */}
        <Text style={styles.label}>{tb(lang, "agencySelect", "Select Agency")}</Text>
        <View style={styles.agencyRow}>
          {["AgencyA", "AgencyB"].map((a) => (
            <TouchableOpacity
              key={a}
              style={[styles.pill, agency === a && styles.pillOn]}
              onPress={() => setAgency(a)}
            >
              <Text
                style={[styles.pillText, agency === a && styles.pillTextOn]}
              >
                {a}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Fields to Share */}
        <Text style={styles.label}>{tb(lang, "fieldsSelect", "Choose Fields to Share")}</Text>
        {DEFAULT_FIELDS.map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.fieldPill, fields.includes(f) && styles.fieldOn]}
            onPress={() => toggleField(f)}
          >
            <MaterialCommunityIcons
              name={fields.includes(f) ? "check-circle" : "circle-outline"}
              size={20}
              color={fields.includes(f) ? COLORS.primary : COLORS.textLight}
            />
            <Text
              style={[styles.fieldText, fields.includes(f) && styles.fieldTextOn]}
            >
              {f}
            </Text>
          </TouchableOpacity>
        ))}

        {/* Action Buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.btn, styles.primaryBtn]}
            onPress={createConsent}
          >
            <MaterialCommunityIcons
              name="link-variant"
              color={COLORS.white}
              size={20}
            />
            <Text style={styles.btnText}>
              {tb(lang, "createToken", "Create Share Token")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btn, styles.secondaryBtn]}
            onPress={generatePdf}
          >
            <MaterialCommunityIcons
              name="file-pdf-box"
              color={COLORS.white}
              size={20}
            />
            <Text style={styles.btnText}>
              {tb(lang, "generatePdf", "Generate PDF")}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Token Result */}
        {tokenUrl && (
          <View style={styles.resultCard}>
            <Text style={styles.resultLabel}>Share Token (QR)</Text>
            <QRCode value={tokenUrl} size={180} />
            <Text style={styles.linkText}>{tokenUrl}</Text>
          </View>
        )}

        {/* PDF Result */}
        {pdfUrl && (
          <View style={styles.resultCard}>
            <Text style={styles.resultLabel}>Filled PDF</Text>
            <TouchableOpacity onPress={() => Linking.openURL(pdfUrl)}>
              <Text style={styles.linkText}>{pdfUrl}</Text>
            </TouchableOpacity>
            <Text style={styles.tipText}>Open this link to download.</Text>
          </View>
        )}

        {/* Next Button */}
        <TouchableOpacity
          style={[styles.btn, styles.nextBtn]}
          onPress={() =>
            navigation.navigate("Facilities", {
              mapping: { schema },
              pdfUrl,
              lang,
            })
          }
        >
          <MaterialCommunityIcons
            name="arrow-right"
            color={COLORS.white}
            size={20}
          />
          <Text style={styles.btnText}>
            {tb(lang, "facilityMatch", "Facility Match")}
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
  header: { fontSize: 26, fontWeight: "800", color: COLORS.primary },
  sub: { color: COLORS.textLight, marginBottom: 12 },
  label: {
    fontWeight: "700",
    marginTop: 14,
    marginBottom: 6,
    color: COLORS.textDark,
  },
  agencyRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  pill: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ccc",
    marginRight: 6,
  },
  pillOn: { backgroundColor: "#E0F7FA", borderColor: COLORS.primary },
  pillText: { color: COLORS.textDark },
  pillTextOn: { color: COLORS.primary, fontWeight: "700" },
  fieldPill: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#ccc",
    marginVertical: 5,
  },
  fieldOn: { backgroundColor: "#E0F7FA", borderColor: COLORS.primary },
  fieldText: { marginLeft: 8, color: COLORS.textDark, fontSize: 15 },
  fieldTextOn: { fontWeight: "700", color: COLORS.primary },
  actionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 16,
  },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 30,
    paddingVertical: 12,
    paddingHorizontal: 18,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  primaryBtn: { backgroundColor: COLORS.primary, flexGrow: 1, flexBasis: "48%" },
  secondaryBtn: { backgroundColor: COLORS.secondary, flexGrow: 1, flexBasis: "48%" },
  nextBtn: {
    backgroundColor: COLORS.success,
    marginTop: 24,
    justifyContent: "center",
    flexBasis: "100%",
  },
  btnText: {
    color: COLORS.white,
    fontWeight: "700",
    fontSize: 15,
    textAlign: "center",
  },
  resultCard: {
    marginTop: 18,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#FAFAFA",
    alignItems: "center",
  },
  resultLabel: { fontWeight: "700", color: COLORS.primary, marginBottom: 10 },
  linkText: { color: COLORS.primary, textAlign: "center", marginTop: 8, fontSize: 13 },
  tipText: { color: COLORS.textLight, marginTop: 4, fontSize: 12 },
});
