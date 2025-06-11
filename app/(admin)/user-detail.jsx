import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import DataTable from "../../components/ui/DataTable";
import Button from "../../components/ui/Button";
import { getUserWithMeasurements } from "../../services/adminService";
import { formatAge } from "../../utils/ageCalculator";
import { Colors } from "../../constants/Colors";

export default function UserDetail() {
  const router = useRouter();
  const { userId, userName } = useLocalSearchParams();
  const insets = useSafeAreaInsets();

  const [userDetails, setUserDetails] = useState(null);
  const [measurements, setMeasurements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sortOrder, setSortOrder] = useState("desc");

  const loadUserDetails = async () => {
    try {
      const result = await getUserWithMeasurements(userId);
      if (result.success) {
        setUserDetails(result.data.user);
        setMeasurements(result.data.measurements);
      } else {
        console.error("Failed to load user details:", result.error);
      }
    } catch (error) {
      console.error("Error loading user details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadUserDetails();
    setRefreshing(false);
  };

  const handleSortToggle = () => {
    const newOrder = sortOrder === "desc" ? "asc" : "desc";
    setSortOrder(newOrder);

    const sortedMeasurements = [...measurements].sort((a, b) => {
      const dateA = a.dateTime.toDate
        ? a.dateTime.toDate()
        : new Date(a.dateTime);
      const dateB = b.dateTime.toDate
        ? b.dateTime.toDate()
        : new Date(b.dateTime);

      return newOrder === "desc" ? dateB - dateA : dateA - dateB;
    });

    setMeasurements(sortedMeasurements);
  };

  const handleBackToAllUsers = () => {
    router.back();
  };

  const handleBackToHome = () => {
    router.push("/(admin)");
  };

  useEffect(() => {
    if (userId) {
      loadUserDetails();
    }
  }, [userId]);

  const formatDateTime = (timestamp) => {
    if (!timestamp) return "N/A";

    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Belum diatur";
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID");
  };

  const tableData = measurements.map((item) => ({
    ...item,
    dateTime: formatDateTime(item.dateTime),
    weight: `${item.weight} kg`,
    height: `${item.height} cm`,
    nutritionStatus: item.nutritionStatus,
  }));

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor={Colors.background}
        />
        <LoadingSpinner text="Memuat detail pengguna..." />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      <View style={styles.header}>
        <Text style={styles.title}>{userName || "Detail Pengguna"}</Text>
        <Text style={styles.subtitle}>Riwayat Pengukuran</Text>
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
        {userDetails && (
          <View style={styles.profileCard}>
            <Text style={styles.cardTitle}>Profil Siswa</Text>

            <View style={styles.profileRow}>
              <Text style={styles.label}>Nama:</Text>
              <Text style={styles.value}>{userDetails.name}</Text>
            </View>

            <View style={styles.profileRow}>
              <Text style={styles.label}>Umur:</Text>
              <Text style={styles.value}>
                {formatAge(userDetails.birthdate)}
              </Text>
            </View>

            <View style={styles.profileRow}>
              <Text style={styles.label}>Jenis Kelamin:</Text>
              <Text style={styles.value}>
                {userDetails.gender === "male"
                  ? "Laki-laki"
                  : userDetails.gender === "female"
                  ? "Perempuan"
                  : "Belum diatur"}
              </Text>
            </View>

            <View style={styles.profileRow}>
              <Text style={styles.label}>Tanggal Lahir:</Text>
              <Text style={styles.value}>
                {formatDate(userDetails.birthdate)}
              </Text>
            </View>

            <View style={styles.profileRow}>
              <Text style={styles.label}>Orang Tua:</Text>
              <Text style={styles.value}>{userDetails.parentName}</Text>
            </View>

            <View style={styles.profileRow}>
              <Text style={styles.label}>RFID:</Text>
              <Text style={[styles.value, !userDetails.rfid && styles.notSet]}>
                {userDetails.rfid || "Belum dipasang"}
              </Text>
            </View>
          </View>
        )}

        <View style={styles.sortContainer}>
          <Text style={styles.sortLabel}>Urutkan berdasarkan Tanggal:</Text>
          <TouchableOpacity
            style={styles.sortButton}
            onPress={handleSortToggle}
          >
            <Text style={styles.sortButtonText}>
              {sortOrder === "desc" ? "Terbaru Dulu ↓" : "Terlama Dulu ↑"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tableContainer}>
          {tableData.length > 0 ? (
            <DataTable
              headers={["Tanggal & Waktu", "Berat", "Tinggi", "Status", "Aksi"]}
              data={tableData}
              onEdit={() => {}}
              onDelete={() => {}}
              keyExtractor={(item, index) => `measurement-${index}`}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Tidak ada data pengukuran</Text>
              <Text style={styles.emptySubtext}>
                Siswa ini belum melakukan pengukuran apapun
              </Text>
            </View>
          )}
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title="Kembali ke Semua Pengguna"
            onPress={handleBackToAllUsers}
            variant="outline"
            style={styles.backButton}
          />

          <Button
            title="Kembali ke Halaman Utama"
            onPress={handleBackToHome}
            style={styles.homeButton}
          />
        </View>
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
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  profileCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
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
  notSet: {
    color: Colors.gray400,
    fontStyle: "italic",
  },
  sortContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.white,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.gray200,
    marginBottom: 16,
  },
  sortLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.gray700,
  },
  sortButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  sortButtonText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: "600",
  },
  tableContainer: {
    flex: 1,
    marginBottom: 24,
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
  buttonContainer: {
    gap: 12,
    marginTop: 16,
  },
  backButton: {
    marginBottom: 8,
  },
  homeButton: {
    marginBottom: 8,
  },
});
