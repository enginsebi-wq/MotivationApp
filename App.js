import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Clipboard from "expo-clipboard";
import { Ionicons } from "@expo/vector-icons";

const QUOTES = [
  { text: "Believe in yourself.", author: "Anonymous" },
  { text: "Keep going. You’re getting there.", author: "Anonymous" },
  { text: "Small steps every day.", author: "Anonymous" },
  { text: "Discipline beats motivation.", author: "Anonymous" },
  { text: "You are stronger than you think.", author: "Anonymous" },
  { text: "Focus on progress, not perfection.", author: "Anonymous" },
  { text: "Start where you are. Use what you have. Do what you can.", author: "Anonymous" },
  { text: "Your only limit is you.", author: "Anonymous" },
  { text: "Consistency compounds.", author: "Anonymous" },
  { text: "Dream big. Start small. Act now.", author: "Anonymous" },
];

const STORAGE_KEY = "favorites_v1";

export default function App() {
  const [currentQuote, setCurrentQuote] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [tab, setTab] = useState("today");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    pickRandom();
    loadFavorites();
  }, []);

  const pickRandom = () => {
    const i = Math.floor(Math.random() * QUOTES.length);
    setCurrentQuote(QUOTES[i]);
  };

  const loadFavorites = async () => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved) setFavorites(JSON.parse(saved));
    } catch {}
  };

  const persistFavorites = async (list) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch {}
  };

  const isFavorited = (quote) =>
    favorites.some((q) => q.text === quote.text && q.author === quote.author);

  const toggleFavorite = () => {
    if (!currentQuote) return;
    const exists = isFavorited(currentQuote);
    const next = exists
      ? favorites.filter(
          (q) => !(q.text === currentQuote.text && q.author === currentQuote.author)
        )
      : [...favorites, currentQuote];
    setFavorites(next);
    persistFavorites(next);
  };

  const shareQuote = async () => {
    if (!currentQuote) return;
    const text = `"${currentQuote.text}" — ${currentQuote.author || "Anonymous"}`;
    await Clipboard.setStringAsync(text);
    setCopied(true);
    if (Platform.OS !== "web") {
      Alert.alert("Copied", "Quote copied to clipboard.");
    }
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <View style={styles.container}>
      {tab === "today" && currentQuote && (
        <View style={styles.centerWrapper}>
          <View style={styles.card}>
            <Text style={styles.quote}>{currentQuote.text}</Text>
            <Text style={styles.author}>— {currentQuote.author || "Anonymous"}</Text>

            <View style={styles.iconRow}>
              <TouchableOpacity onPress={toggleFavorite} style={styles.iconBtn}>
                <Ionicons
                  name={isFavorited(currentQuote) ? "heart" : "heart-outline"}
                  size={28}
                  color={isFavorited(currentQuote) ? "#e11d48" : "#8b8b8b"}
                />
              </TouchableOpacity>

              <TouchableOpacity onPress={shareQuote} style={styles.iconBtn}>
                <Ionicons name="share-social-outline" size={28} color="#8b8b8b" />
              </TouchableOpacity>
            </View>

            {copied && (
              <View style={styles.copiedPill}>
                <Text style={styles.copiedText}>Copied to clipboard</Text>
              </View>
            )}

            <TouchableOpacity onPress={pickRandom} style={styles.primaryBtn}>
              <Text style={styles.primaryBtnText}>New Quote</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {tab === "favorites" && (
        <ScrollView contentContainerStyle={styles.favContainer}>
          {favorites.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="heart-outline" size={60} color="#cfcfcf" />
              <Text style={styles.emptyText}>No favorites yet</Text>
            </View>
          ) : (
            favorites.map((q, idx) => (
              <View key={idx} style={styles.favCard}>
                <Text style={styles.favText}>{q.text}</Text>
                <View style={styles.favRow}>
                  <Text style={styles.favAuthor}>— {q.author || "Anonymous"}</Text>
                  <TouchableOpacity
                    onPress={() => {
                      const next = favorites.filter(
                        (f) => !(f.text === q.text && f.author === q.author)
                      );
                      setFavorites(next);
                      persistFavorites(next);
                    }}
                    style={styles.smallIconBtn}
                  >
                    <Ionicons name="heart-dislike-outline" size={22} color="#e11d48" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      )}

      <View style={styles.navbar}>
        <TouchableOpacity onPress={() => setTab("today")} style={styles.navItem}>
          <Ionicons
            name="sparkles-outline"
            size={24}
            color={tab === "today" ? "#db2777" : "#9ca3af"}
          />
          <Text style={[styles.navText, tab === "today" && styles.navActiveText]}>
            Today
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setTab("favorites")} style={styles.navItem}>
          <Ionicons
            name="heart-outline"
            size={24}
            color={tab === "favorites" ? "#db2777" : "#9ca3af"}
          />
          <Text
            style={[styles.navText, tab === "favorites" && styles.navActiveText]}
          >
            Favorites
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fdebf2",
  },
  centerWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 80,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 28,
    padding: 24,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 3,
    width: "100%",
    maxWidth: 360,
  },
  quote: {
    fontSize: 22,
    lineHeight: 30,
    textAlign: "center",
    color: "#2d2d2d",
  },
  author: {
    marginTop: 14,
    textAlign: "center",
    color: "#6b7280",
    fontStyle: "italic",
    marginBottom: 20,
  },
  iconRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 18,
    marginBottom: 12,
  },
  iconBtn: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 40,
    elevation: 2,
  },
  copiedPill: {
    alignSelf: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    elevation: 2,
    marginBottom: 10,
  },
  copiedText: { color: "#6b7280", fontSize: 12 },
  primaryBtn: {
    backgroundColor: "#db2777",
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: "center",
  },
  primaryBtnText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  navbar: {
  position: "absolute",
  left: 0,
  right: 0,
  bottom: Platform.OS === "android" ? 40 : 20, // 🔥 Android’de daha yukarı taşı
  backgroundColor: "#fff",
  borderTopWidth: 1,
  borderColor: "#eee",
  paddingVertical: 12,
  borderRadius: 20,
  marginHorizontal: 20,
  flexDirection: "row",
  justifyContent: "space-around",
  alignItems: "center",
  shadowColor: "#000",
  shadowOpacity: 0.1,
  shadowOffset: { width: 0, height: 2 },
  shadowRadius: 4,
  elevation: 6,
},


  navItem: { alignItems: "center" },
  navText: { marginTop: 4, color: "#9ca3af", fontWeight: "600" },
  navActiveText: { color: "#db2777" },
  empty: { alignItems: "center", marginTop: 80 },
  emptyText: { color: "#777", marginTop: 8 },
  favContainer: { padding: 20, paddingBottom: 120 },
  favCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
    marginBottom: 10,
  },
  favText: { fontSize: 16, color: "#2d2d2d", marginBottom: 6 },
  favRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  favAuthor: { color: "#6b7280" },
  smallIconBtn: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: "#fff",
    elevation: 1,
  },
});
