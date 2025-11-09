import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import { Audio } from "expo-av";
import { upload, api } from "../api/client";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { t, tb } from "../i18n/u"; // ✅ translation helper
import { LinearGradient } from "expo-linear-gradient";

const COLORS = {
  primary: "#4EB1B8", // Teal
  secondary: "#FF8A65", // Coral
  success: "#4CAF50", // Green
  background: "#F9F9F9", // Cream
  textDark: "#1A1A1A",
  textLight: "#666",
  white: "#FFFFFF",
};

export default function IntakeScreen({ route, navigation }) {
  const { lang = "en" } = route.params || {};
  const [recording, setRecording] = useState(null);
  const [busy, setBusy] = useState(false);
  const [text, setText] = useState("");
  const [translation, setTranslation] = useState("");
  const [phone, setPhone] = useState("");

  const startRecording = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      const rec = new Audio.Recording();
      await rec.prepareToRecordAsync({
        android: {
          extension: ".wav",
          outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_LINEARPCM,
          audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_DEFAULT,
          sampleRate: 16000,
          numberOfChannels: 1,
        },
        ios: {
          extension: ".wav",
          audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_MEDIUM,
          sampleRate: 16000,
          numberOfChannels: 1,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
      });
      await rec.startAsync();
      setRecording(rec);
    } catch (e) {
      Alert.alert("Audio error", String(e));
    }
  };

  const stopRecording = async () => {
    try {
      setBusy(true);
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      const formData = new FormData();
      formData.append("audio", { uri, name: "audio.wav", type: "audio/wav" });

      const res = await upload(`/speech/transcribe?languageCode=${lang}`, formData);
      setText(res.transcript || "");
      setTranslation(res.translation || "");
      Alert.alert("Transcription complete", "Check the text boxes.");
    } catch (e) {
      Alert.alert("Transcription failed", String(e));
    } finally {
      setRecording(null);
      setBusy(false);
    }
  };

  const onContinue = async () => {
    if (!text.trim())
      return Alert.alert("Please record or type your story first.");
    setBusy(true);
    try {
      const out = await api("/intake/map", {
        method: "POST",
        body: JSON.stringify({
          transcript: text,
          language: lang,
          contact_phone: phone,
        }),
      });
      navigation.navigate("Review", { mapping: out, language: lang });
    } catch (e) {
      Alert.alert("Mapping failed", String(e));
    } finally {
      setBusy(false);
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
        <Text style={styles.header}>{tb(lang, "tellYourStory")}</Text>
        <Text style={styles.sub}>{tb(lang, "welcomeSubtitle")}</Text>

        {/* Story Input */}
        <TextInput
          style={styles.input}
          multiline
          value={text}
          onChangeText={setText}
          placeholder={t(lang, "tellYourStory")}
        />

        {/* English Translation */}
        {translation ? (
          <>
            <Text style={styles.label}>{tb(lang, "englishTranslation")}</Text>
            <TextInput
              style={[styles.input, styles.translationBox]}
              editable={false}
              multiline
              value={translation}
            />
          </>
        ) : null}

        {/* Contact Phone */}
        <Text style={styles.label}>{tb(lang, "contactPhone")}</Text>
        <TextInput
          style={styles.input}
          keyboardType="phone-pad"
          placeholder="+1XXXXXXXXXX"
          value={phone}
          onChangeText={setPhone}
        />

        {/* Buttons */}
        <View style={styles.buttonRow}>
          {!recording ? (
            <TouchableOpacity
              style={[styles.btn, styles.recordBtn]}
              onPress={startRecording}
              disabled={busy}
            >
              <MaterialCommunityIcons
                name="microphone"
                color={COLORS.white}
                size={22}
              />
              <Text style={styles.btnText}>{tb(lang, "record")}</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.btn, styles.stopBtn]}
              onPress={stopRecording}
            >
              <MaterialCommunityIcons
                name="stop"
                color={COLORS.white}
                size={22}
              />
              <Text style={styles.btnText}>
                {busy ? "Processing..." : tb(lang, "stopTranscribe")}
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.btn, styles.nextBtn]}
            onPress={onContinue}
            disabled={busy}
          >
            <Text style={styles.btnText}>{tb(lang, "reviewEdit")}</Text>
          </TouchableOpacity>
        </View>
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
    fontSize: 24,
    fontWeight: "800",
    color: COLORS.primary,
    marginBottom: 6,
  },
  sub: { color: COLORS.textLight, marginBottom: 12 },
  label: { fontWeight: "600", color: COLORS.textDark, marginTop: 12 },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    backgroundColor: COLORS.background,
    textAlignVertical: "top",
    minHeight: 80,
  },
  translationBox: { backgroundColor: "#f1f9f9" },
  buttonRow: {
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
    elevation: 2,
  },
  recordBtn: { backgroundColor: COLORS.secondary, flexGrow: 1, flexBasis: "48%" },
  stopBtn: { backgroundColor: COLORS.primary, flexGrow: 1, flexBasis: "48%" },
  nextBtn: { backgroundColor: COLORS.success, flexBasis: "100%", justifyContent: "center" },
  btnText: { color: COLORS.white, fontWeight: "700", fontSize: 15, textAlign: "center" },
});
