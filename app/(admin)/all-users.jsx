import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import Button from "../../components/ui/Button";
import {
  getAllUsers,
  getAllUsersWithMeasurements,
} from "../../services/adminService";
import { generateAllUsersPDF } from "../../services/pdfService";
import { endGlobalSession } from "../../services/globalSessionService";
import { formatAge } from "../../utils/ageCalculator";
import { Colors } from "../../constants/Colors";

export default function AllUsers() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [exportingPDF, setExportingPDF] = useState(false);
  const [resettingSession, setResettingSession] = useState(false);

  const loadUsers = async () => {
    try {
      const result = await getAllUsers();
      if (result.success) {
        setUsers(result.data);
      } else {
        console.error("Failed to load users:", result.error);
      }
    } catch (error) {
      console.error("Error loading users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadUsers();
    setRefreshing(false);
  };

  const handleUserPress = (user) => {
    router.push({
      pathname: "/(admin)/user-detail",
      params: { userId: user.id, userName: user.name },
    });
  };

  const handleExportPDF = async () => {
    if (users.length === 0) {
      Alert.alert("Tidak Ada Data", "Tidak ada data siswa untuk diekspor");
      return;
    }

    Alert.alert(
      "Export PDF",
      "Apakah Anda yakin ingin mengexport semua data siswa ke PDF? Proses ini mungkin memakan waktu beberapa saat.",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Export",
          onPress: async () => {
            setExportingPDF(true);
            try {
              const result = await getAllUsersWithMeasurements();
              if (result.success) {
                const pdfResult = await generateAllUsersPDF(result.data);
                if (pdfResult.success) {
                  Alert.alert("Berhasil", "PDF berhasil dibuat dan dibagikan!");
                } else {
                  Alert.alert("Gagal", pdfResult.error || "Gagal membuat PDF");
                }
              } else {
                Alert.alert("Gagal", "Gagal mengambil data untuk PDF");
              }
            } catch (error) {
              Alert.alert("Kesalahan", "Terjadi kesalahan saat membuat PDF");
            } finally {
              setExportingPDF(false);
            }
          },
        },
      ]
    );
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

  useEffect(() => {
    loadUsers();
  }, []);

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor={Colors.background}
        />
        <LoadingSpinner text="Memuat pengguna..." />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      <View style={styles.header}>
        <Text style={styles.title}>Semua Pengguna</Text>
        <Text style={styles.subtitle}>Manajemen Siswa</Text>
      </View>

      <View style={styles.actionsContainer}>
        <Button
          title={exportingPDF ? "📄 Membuat PDF..." : "📄 Export PDF"}
          onPress={handleExportPDF}
          style={styles.exportButton}
          disabled={exportingPDF || users.length === 0}
        />
        <Button
          title={resettingSession ? "🔄 Mereset..." : "🔄 Reset Session"}
          onPress={handleResetSession}
          style={styles.resetButton}
          variant="outline"
          disabled={resettingSession}
        />
      </View>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 20 },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {users.length > 0 ? (
          <View style={styles.usersContainer}>
            {users.map((user, index) => (
              <TouchableOpacity
                key={user.id}
                style={styles.userCard}
                onPress={() => handleUserPress(user)}
                activeOpacity={0.7}
              >
                <View style={styles.userHeader}>
                  <View style={styles.userAvatar}>
                    <Text style={styles.avatarText}>
                      {user.name?.charAt(0)?.toUpperCase() || "U"}
                    </Text>
                  </View>
                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>{user.name}</Text>
                    <Text style={styles.userAge}>
                      {formatAge(user.birthdate)}
                    </Text>
                  </View>
                  <View style={styles.userArrow}>
                    <Text style={styles.arrowText}>→</Text>
                  </View>
                </View>

                <View style={styles.userDetails}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Orang Tua:</Text>
                    <Text style={styles.detailValue}>{user.parentName}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Jenis Kelamin:</Text>
                    <Text style={styles.detailValue}>
                      {user.gender === "male"
                        ? "Laki-laki"
                        : user.gender === "female"
                        ? "Perempuan"
                        : "Belum diatur"}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>RFID:</Text>
                    <Text
                      style={[
                        styles.detailValue,
                        !user.rfid && styles.notAssigned,
                      ]}
                    >
                      {user.rfid 
                        ? `${user.rfid}${user.rfidNumber ? ` (No. ${user.rfidNumber})` : ''}` 
                        : "Belum dipasang"}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Tidak ada pengguna ditemukan</Text>
            <Text style={styles.emptySubtext}>
              Belum ada akun siswa yang dibuat
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray200,
    backgroundColor: Colors.white,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.gray900,
    textAlign: "center",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.gray600,
    textAlign: "center",
  },
  actionsContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray200,
  },
  exportButton: {
    marginBottom: 12,
  },
  resetButton: {
    marginBottom: 0,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  usersContainer: {
    gap: 16,
    marginBottom: 24,
  },
  userCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.gray200,
    shadowColor: Colors.shadow.color,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.white,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.gray900,
    marginBottom: 2,
  },
  userAge: {
    fontSize: 14,
    color: Colors.gray600,
  },
  userArrow: {
    marginLeft: 8,
  },
  arrowText: {
    fontSize: 18,
    color: Colors.gray400,
  },
  userDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.gray600,
  },
  detailValue: {
    fontSize: 14,
    color: Colors.gray900,
    textAlign: "right",
    flex: 1,
    marginLeft: 8,
  },
  notAssigned: {
    color: Colors.gray400,
    fontStyle: "italic",
  },
  emptyContainer: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 32,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.gray700,
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.gray500,
    textAlign: "center",
    lineHeight: 20,
  },
});
