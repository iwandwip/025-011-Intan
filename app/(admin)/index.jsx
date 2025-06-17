import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Alert,
  ScrollView,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../contexts/AuthContext";
import Button from "../../components/ui/Button";
import { signOutUser } from "../../services/authService";
import { endGlobalSession } from "../../services/globalSessionService";
import { Colors } from "../../constants/Colors";

function AdminHome() {
  const { currentUser, userProfile } = useAuth();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [resettingSession, setResettingSession] = useState(false);
  const navigationRef = useRef(false);

  const handleLogout = async () => {
    if (loggingOut || navigationRef.current) return;

    setLoggingOut(true);
    const result = await signOutUser();

    if (result.success) {
      navigationRef.current = true;
      router.replace("/(auth)/login");
    } else {
      Alert.alert("Logout Gagal", "Gagal logout. Silakan coba lagi.");
    }

    setLoggingOut(false);
  };

  const getWelcomeMessage = () => {
    return "Selamat Datang Admin!";
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate a refresh delay
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const handleResetSession = async () => {
    Alert.alert(
      "Reset Session",
      "Apakah Anda yakin ingin mereset semua global session? Ini akan menghentikan semua sesi yang sedang berlangsung (pairing, weighing, dll).",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            setResettingSession(true);
            try {
              const result = await endGlobalSession();
              if (result.success) {
                Alert.alert("Berhasil", "Semua global session berhasil direset!");
              } else {
                Alert.alert("Gagal", result.error || "Gagal mereset session");
              }
            } catch (error) {
              Alert.alert("Kesalahan", "Terjadi kesalahan saat mereset session");
            } finally {
              setResettingSession(false);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <View style={styles.content}>
          <Text style={styles.title}>{getWelcomeMessage()}</Text>

          <View style={styles.profileContainer}>
            <View style={styles.profileCard}>
              <Text style={styles.cardTitle}>Profil Admin</Text>

              <View style={styles.profileRow}>
                <Text style={styles.label}>Nama:</Text>
                <Text style={styles.value}>Admin</Text>
              </View>

              <View style={styles.profileRow}>
                <Text style={styles.label}>Peran:</Text>
                <Text style={styles.value}>Guru</Text>
              </View>

              <View style={styles.profileRow}>
                <Text style={styles.label}>Email:</Text>
                <Text style={styles.value}>{currentUser?.email}</Text>
              </View>

              <View style={styles.profileRow}>
                <Text style={styles.label}>Tingkat Akses:</Text>
                <Text style={styles.value}>Administrator</Text>
              </View>
            </View>

            <View style={styles.statsCard}>
              <Text style={styles.cardTitle}>Ringkasan Sistem</Text>

              <View style={styles.statItem}>
                <Text style={styles.statIcon}>👥</Text>
                <View style={styles.statContent}>
                  <Text style={styles.statLabel}>Manajemen Pengguna</Text>
                  <Text style={styles.statDescription}>
                    Lihat dan kelola semua data siswa
                  </Text>
                </View>
              </View>

              <View style={styles.statItem}>
                <Text style={styles.statIcon}>📊</Text>
                <View style={styles.statContent}>
                  <Text style={styles.statLabel}>Analisis Data</Text>
                  <Text style={styles.statDescription}>
                    Pantau tren status gizi
                  </Text>
                </View>
              </View>

              <View style={styles.statItem}>
                <Text style={styles.statIcon}>⚖️</Text>
                <View style={styles.statContent}>
                  <Text style={styles.statLabel}>Integrasi IoT</Text>
                  <Text style={styles.statDescription}>
                    Sistem timbangan terhubung
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.actionsContainer}>
            <Button
              title={resettingSession ? "🔄 Mereset..." : "🔄 Reset Session"}
              onPress={handleResetSession}
              style={styles.resetButton}
              disabled={resettingSession}
            />
            <Button
              title={loggingOut ? "Keluar..." : "Keluar"}
              onPress={handleLogout}
              variant="outline"
              style={styles.logoutButton}
              disabled={loggingOut}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 24,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.gray900,
    marginBottom: 24,
    textAlign: "center",
  },
  profileContainer: {
    marginBottom: 32,
  },
  profileCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: Colors.shadow.color,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 20,
    shadowColor: Colors.shadow.color,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.gray900,
    marginBottom: 16,
    textAlign: "center",
  },
  profileRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.gray600,
    flex: 1,
  },
  value: {
    fontSize: 14,
    color: Colors.gray900,
    flex: 2,
    textAlign: "right",
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },
  statIcon: {
    fontSize: 24,
    marginRight: 16,
    width: 32,
  },
  statContent: {
    flex: 1,
  },
  statLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.gray900,
    marginBottom: 4,
  },
  statDescription: {
    fontSize: 14,
    color: Colors.gray600,
  },
  actionsContainer: {
    gap: 12,
  },
  resetButton: {
    marginBottom: 8,
  },
  logoutButton: {
    marginBottom: 8,
  },
});

export default AdminHome;
