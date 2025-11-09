import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { t, tb } from "../i18n/u"; // ✅ new translation helper
import { LinearGradient } from "expo-linear-gradient";

const COLORS = {
  primary: "#4EB1B8", // Teal
  secondary: "#FF8A65", // Coral
  success: "#4CAF50", // Green
  background: "#F9F9F9", // Cream
  white: "#FFFFFF",
  textDark: "#1A1A1A",
  textLight: "#666",
};

export default function BackpackScreen({ route }) {
  const { lang = "en" } = route?.params || {};

  const [items, setItems] = useState([
    {
      id: "1",
      type: "PDF",
      title: "AgencyA Intake Form",
      date: "2025-02-15",
      color: COLORS.primary,
    },
    {
      id: "2",
      type: "Consent",
      title: "AgencyB Consent Token",
      date: "2025-02-16",
      color: COLORS.secondary,
    },
  ]);

  useEffect(() => {
    // Future enhancement: Load items from backend or local storage.
  }, []);

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
      <Text style={styles.header}>{tb(lang, "backpack")}</Text>
      <Text style={styles.sub}>{tb(lang, "backpackSub")}</Text>

      {items.length === 0 && (
        <View style={styles.emptyBox}>
          <MaterialCommunityIcons
            name="briefcase-outline"
            size={60}
            color={COLORS.textLight}
          />
          <Text style={styles.emptyText}>{tb(lang, "noItems")}</Text>
        </View>
      )}

      {items.map((item) => (
        <TouchableOpacity key={item.id} style={styles.card}>
          <View style={styles.row}>
            <MaterialCommunityIcons
              name={item.type === "PDF" ? "file-pdf-box" : "link-variant"}
              size={32}
              color={item.color}
            />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardType}>
                {item.type} • {item.date}
              </Text>
            </View>
            <MaterialCommunityIcons
              name="chevron-right"
              size={28}
              color={COLORS.textLight}
            />
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", padding: 20 },
  header: {
    fontSize: 26,
    fontWeight: "800",
    color: COLORS.primary,
    marginBottom: 4,
  },
  sub: {
    color: COLORS.textLight,
    fontSize: 14,
    textAlign: "center",
    marginBottom: 20,
  },
  emptyBox: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 40,
    width: "100%",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    elevation: 3,
  },
  emptyText: {
    color: COLORS.textLight,
    textAlign: "center",
    marginTop: 10,
  },
  card: {
    width: "100%",
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  row: { flexDirection: "row", alignItems: "center" },
  cardTitle: { fontWeight: "700", color: COLORS.textDark, fontSize: 16 },
  cardType: { color: COLORS.textLight, marginTop: 2, fontSize: 13 },
});
