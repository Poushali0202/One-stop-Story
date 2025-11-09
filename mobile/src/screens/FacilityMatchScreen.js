import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Linking,
  Alert,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { api } from "../api/client";
import { t, tb } from "../i18n/u"; // ✅ new translation import
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

export default function FacilityMatchScreen({ route }) {
  const mapping = route.params?.mapping || {};
  const needs = mapping?.schema?.needs?.map((n) => n.value || n) || [];
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  const pdfUrl = route.params?.pdfUrl || null;
  const { lang = "en" } = route.params || {};

  useEffect(() => {
    (async () => {
      try {
        const res = await api("/facilities", {
          method: "POST",
          body: JSON.stringify({ needs }),
        });
        const facilities = (res.facilities || []).map((f, i) => ({
          ...f,
          phone: f.phone || "+14111151111",
          email: f.email || `contact${i + 1}@facility.org`,
        }));
        setList(facilities);
      } catch (e) {
        console.log("Facility fetch failed:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const callFacility = (phone) => {
    if (!phone) return Alert.alert("No phone number found for this facility.");
    Linking.openURL(`tel:${phone}`).catch(() =>
      Alert.alert("Unable to open dialer.")
    );
  };

  const emailFacility = (email, name) => {
    if (!email) return Alert.alert("No email address found for this facility.");
    const subject = `Request for Assistance from One-stop-Story`;
    const body = `Hello ${name || "Facility"},%0D%0A%0D%0AI am reaching out via the One-stop-Story app regarding available services that match my reported needs.%0D%0A%0D%0AHere is my intake summary and requested support.%0D%0A%0D%0A${
      pdfUrl ? "My completed intake PDF: " + pdfUrl + "%0D%0A%0D%0A" : ""
    }Thank you for your time and support.%0D%0A%0D%0A– Sent via One-stop-Story`;
    Linking.openURL(`mailto:${email}?subject=${subject}&body=${body}`).catch(() =>
      Alert.alert("Unable to open email client.")
    );
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>{tb(lang, "facilityMatch")}...</Text>
      </View>
    );
  }

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
      <Text style={styles.header}>{tb(lang, "facilityMatch")}</Text>

      {list.length === 0 && (
        <Text style={styles.noResult}>
          {t(lang, "noFacility", "No facilities found for these needs.")}
        </Text>
      )}

      {list.map((f) => (
        <View key={f.id || f.name} style={styles.card}>
          <View style={styles.row}>
            <MaterialCommunityIcons
              name="home-heart"
              size={26}
              color={COLORS.primary}
            />
            <Text style={styles.name}>{f.name}</Text>
          </View>

          <Text style={styles.addr}>{f.address}</Text>

          <Text style={styles.meta}>
            {t(lang, "tags", "Tags")}: {(f.tags || []).join(", ")}
          </Text>
          <Text style={styles.meta}>
            Privacy: {(f.privacy * 100).toFixed(0)}% | ADA:{" "}
            {(f.ada * 100).toFixed(0)}%
          </Text>

          <Text style={styles.notes}>
            {f.notes && f.notes.length > 0
              ? f.notes.join("; ")
              : "No additional notes."}
          </Text>

          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.btn, styles.callBtn]}
              onPress={() => callFacility(f.phone)}
            >
              <MaterialCommunityIcons
                name="phone"
                color={COLORS.white}
                size={18}
              />
              <Text style={styles.btnText}>{t(lang, "call", "Call")}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btn, styles.emailBtn]}
              onPress={() => emailFacility(f.email, f.name)}
            >
              <MaterialCommunityIcons
                name="email-outline"
                color={COLORS.white}
                size={18}
              />
              <Text style={styles.btnText}>{t(lang, "email", "Email")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  loadingText: { color: COLORS.textLight, marginTop: 10 },
  container: { padding: 20, alignItems: "center" },
  header: {
    fontSize: 26,
    fontWeight: "800",
    color: COLORS.primary,
    marginBottom: 18,
  },
  noResult: { color: COLORS.textLight, fontSize: 16, textAlign: "center" },
  card: {
    width: "100%",
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    elevation: 3,
  },
  row: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  name: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.textDark,
    marginLeft: 8,
    flexShrink: 1,
  },
  addr: {
    color: COLORS.textLight,
    fontSize: 14,
    marginBottom: 6,
    marginLeft: 2,
  },
  meta: {
    fontSize: 14,
    color: COLORS.textDark,
    marginBottom: 2,
  },
  notes: {
    color: COLORS.textLight,
    marginTop: 8,
    fontStyle: "italic",
    fontSize: 13,
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 14,
  },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 30,
    paddingVertical: 10,
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  callBtn: { backgroundColor: COLORS.success },
  emailBtn: { backgroundColor: COLORS.secondary },
  btnText: {
    color: COLORS.white,
    fontWeight: "700",
    fontSize: 15,
    marginLeft: 5,
  },
});
