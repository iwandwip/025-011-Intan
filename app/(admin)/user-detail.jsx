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
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import DataTable from "../../components/ui/DataTable";
import Button from "../../components/ui/Button";
import EditUserModal from "../../components/ui/EditUserModal";
import RFIDNumberModal from "../../components/ui/RFIDNumberModal";
import RFIDPairingMethodModal from "../../components/ui/RFIDPairingMethodModal";
import {
  getUserWithMeasurements,
  updateUserProfile,
  deleteUserAccount,
} from "../../services/adminService";
import { removeUserRFID } from "../../services/userService";
import {
  subscribeToSystemStatus,
  startRfidSession,
  endGlobalSession,
  initializeSystemStatus,
} from "../../services/globalSessionService";
import {
  GLOBAL_SESSION_TYPES,
  getSessionStatusMessage,
  isSessionAvailable,
  isMySession,
} from "../../utils/globalStates";
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
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [systemStatus, setSystemStatus] = useState(null);
  const [rfidLoading, setRfidLoading] = useState(false);
  const [rfidNumberModalVisible, setRfidNumberModalVisible] = useState(false);
  const [rfidMethodModalVisible, setRfidMethodModalVisible] = useState(false);
  const [pendingRfidData, setPendingRfidData] = useState(null);

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

  const handleEditUser = () => {
    setEditModalVisible(true);
  };

  const handleSaveEdit = async (updateData) => {
    try {
      const result = await updateUserProfile(userId, updateData);
      if (result.success) {
        Alert.alert("Berhasil", "Profil siswa berhasil diperbarui!");
        setEditModalVisible(false);
        await loadUserDetails();
      } else {
        Alert.alert("Gagal", result.error || "Gagal memperbarui profil");
      }
    } catch (error) {
      Alert.alert("Kesalahan", "Terjadi kesalahan saat memperbarui profil");
    }
  };

  const handleDeleteUser = () => {
    Alert.alert(
      "Hapus Akun Siswa",
      `Apakah Anda yakin ingin menghapus akun ${userDetails?.name}?\n\nTindakan ini akan:\n• Menghapus semua data pengukuran\n• Menghapus profil siswa\n• Tidak dapat dibatalkan`,
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus",
          style: "destructive",
          onPress: async () => {
            setDeleting(true);
            try {
              const result = await deleteUserAccount(userId);
              if (result.success) {
                Alert.alert("Berhasil", "Akun siswa berhasil dihapus!", [
                  {
                    text: "OK",
                    onPress: () => router.replace("/(admin)/all-users"),
                  },
                ]);
              } else {
                Alert.alert("Gagal", result.error || "Gagal menghapus akun");
              }
            } catch (error) {
              Alert.alert("Kesalahan", "Terjadi kesalahan saat menghapus akun");
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  const handleBackToAllUsers = () => {
    router.back();
  };

  const handleBackToHome = () => {
    router.push("/(admin)");
  };

  const handleRfidPairing = async () => {
    if (!isSessionAvailable(systemStatus)) {
      Alert.alert(
        "Alat Sedang Digunakan",
        getSessionStatusMessage(systemStatus)
      );
      return;
    }

    setRfidMethodModalVisible(true);
  };

  const handleDevicePairing = async () => {
    try {
      setRfidLoading(true);
      setRfidMethodModalVisible(false);
      const result = await startRfidSession(userId, userDetails.name);

      if (result.success) {
        Alert.alert(
          "Siap untuk Pairing",
          `Silakan tap kartu RFID untuk ${userDetails.name} pada perangkat untuk melakukan pairing.`
        );
      } else {
        Alert.alert("Gagal Pairing", result.error);
      }
    } catch (error) {
      Alert.alert("Gagal Pairing", "Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setRfidLoading(false);
    }
  };

  const handleManualPairing = async (rfidCode, rfidNumber) => {
    try {
      const result = await updateUserProfile(userId, {
        rfid: rfidCode,
        rfidNumber: rfidNumber,
      });

      if (result.success) {
        await loadUserDetails();
        setRfidMethodModalVisible(false);
        Alert.alert(
          "RFID Berhasil Dipasang",
          `Kartu RFID nomor ${rfidNumber} untuk ${userDetails.name} berhasil dipasang!`,
          [{ text: "OK" }]
        );
      } else {
        throw new Error(result.error || "Gagal menyimpan data RFID");
      }
    } catch (error) {
      console.error("Manual RFID error:", error);
      Alert.alert("Kesalahan", error.message || "Terjadi kesalahan saat menyimpan RFID");
      throw error;
    }
  };

  const handleRemoveRfid = async () => {
    Alert.alert(
      "Hapus RFID",
      `Apakah Anda yakin ingin menghapus kartu RFID milik ${userDetails.name}?`,
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus",
          style: "destructive",
          onPress: async () => {
            try {
              setRfidLoading(true);
              const result = await removeUserRFID(userId);

              if (result.success) {
                await loadUserDetails();
                Alert.alert(
                  "RFID Dihapus",
                  `Kartu RFID milik ${userDetails.name} berhasil dihapus.`
                );
              } else {
                Alert.alert(
                  "Gagal",
                  "Gagal menghapus RFID. Silakan coba lagi."
                );
              }
            } catch (error) {
              Alert.alert(
                "Kesalahan",
                "Terjadi kesalahan saat menghapus RFID."
              );
            } finally {
              setRfidLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleRfidSuccess = async (rfidData) => {
    setPendingRfidData(rfidData);
    setRfidNumberModalVisible(true);
  };

  const handleRfidNumberConfirm = async (rfidCode, rfidNumber) => {
    try {
      const result = await updateUserProfile(userId, {
        rfid: rfidCode,
        rfidNumber: rfidNumber,
      });

      if (result.success) {
        await loadUserDetails();
        await endGlobalSession();
        setRfidNumberModalVisible(false);
        setPendingRfidData(null);

        Alert.alert(
          "RFID Berhasil Dipasang",
          `Kartu RFID nomor ${rfidNumber} untuk ${userDetails.name} berhasil dipasang!`,
          [{ text: "OK" }]
        );
      } else {
        Alert.alert("Gagal", "Gagal menyimpan data RFID");
      }
    } catch (error) {
      console.error("RFID completion error:", error);
      Alert.alert("Kesalahan", "Terjadi kesalahan saat menyimpan RFID");
    }
  };

  const handleRfidNumberCancel = async () => {
    try {
      await endGlobalSession();
      setRfidNumberModalVisible(false);
      setPendingRfidData(null);
      Alert.alert("Dibatalkan", "Pairing RFID telah dibatalkan");
    } catch (error) {
      console.error("Cancel RFID error:", error);
      Alert.alert("Kesalahan", "Gagal membatalkan pairing RFID");
    }
  };

  const handleCancelRfidPairing = async () => {
    try {
      await endGlobalSession();
      Alert.alert("Dibatalkan", "Pairing RFID telah dibatalkan");
    } catch (error) {
      console.error("Cancel RFID error:", error);
      Alert.alert("Kesalahan", "Gagal membatalkan pairing RFID");
    }
  };

  const isRfidPairing = () => {
    return (
      systemStatus?.sessionType === GLOBAL_SESSION_TYPES.RFID &&
      isMySession(systemStatus, userId)
    );
  };

  const canStartRfidPairing = () => {
    return isSessionAvailable(systemStatus) && !rfidLoading && !loading;
  };

  const hasRfid = () => {
    return userDetails?.rfid && userDetails.rfid.trim() !== "";
  };

  useEffect(() => {
    if (userId) {
      loadUserDetails();
    }
    initializeSystemStatus();
  }, [userId]);

  useEffect(() => {
    if (!userId) return;

    const unsubscribe = subscribeToSystemStatus((doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setSystemStatus(data);

        if (
          data.sessionType === GLOBAL_SESSION_TYPES.RFID &&
          data.currentUserId === userId &&
          data.rfid &&
          data.rfid.trim() !== ""
        ) {
          handleRfidSuccess(data.rfid);
        }
      }
    });

    return unsubscribe;
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
                {userDetails.rfid 
                  ? `${userDetails.rfid}${userDetails.rfidNumber ? ` (No. ${userDetails.rfidNumber})` : ''}` 
                  : "Belum dipasang"}
              </Text>
            </View>

            <View style={styles.rfidSection}>
              <Text style={styles.rfidSectionTitle}>Kelola RFID</Text>
              <View style={styles.rfidStatus}>
                <Text style={styles.rfidStatusText}>
                  {getSessionStatusMessage(systemStatus)}
                </Text>
              </View>

              {isRfidPairing() ? (
                <View style={styles.rfidPairingContainer}>
                  <LoadingSpinner
                    size="small"
                    text={`Tap kartu RFID untuk ${userDetails.name}...`}
                  />
                  <Button
                    title="Batal"
                    onPress={handleCancelRfidPairing}
                    variant="outline"
                    style={styles.cancelRfidButton}
                  />
                </View>
              ) : (
                <View style={styles.rfidActions}>
                  <Button
                    title={
                      hasRfid() ? "🔄 Pasang Ulang RFID" : "📱 Pasang RFID"
                    }
                    onPress={handleRfidPairing}
                    variant="outline"
                    style={styles.rfidButton}
                    disabled={!canStartRfidPairing()}
                  />

                  {hasRfid() && (
                    <Button
                      title="🗑️ Hapus RFID"
                      onPress={handleRemoveRfid}
                      variant="outline"
                      style={[styles.rfidButton, styles.removeRfidButton]}
                      disabled={rfidLoading || loading}
                    />
                  )}
                </View>
              )}
            </View>

            <View style={styles.profileActions}>
              <Button
                title="✏️ Edit Profil"
                onPress={handleEditUser}
                style={styles.editButton}
              />
              <Button
                title={deleting ? "🗑️ Menghapus..." : "🗑️ Hapus Akun"}
                onPress={handleDeleteUser}
                variant="outline"
                style={styles.deleteButton}
                disabled={deleting}
              />
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
              headers={["Tanggal & Waktu", "Berat", "Tinggi", "Usia", "Gender", "Status", "Aksi"]}
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

      <EditUserModal
        visible={editModalVisible}
        user={userDetails}
        onClose={() => setEditModalVisible(false)}
        onSave={handleSaveEdit}
      />

      <RFIDNumberModal
        visible={rfidNumberModalVisible}
        rfidCode={pendingRfidData}
        userName={userDetails?.name}
        userId={userId}
        onConfirm={handleRfidNumberConfirm}
        onCancel={handleRfidNumberCancel}
      />

      <RFIDPairingMethodModal
        visible={rfidMethodModalVisible}
        userName={userDetails?.name}
        onClose={() => setRfidMethodModalVisible(false)}
        onDevicePairing={handleDevicePairing}
        onManualPairing={handleManualPairing}
        loading={rfidLoading}
      />
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
  profileActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.gray100,
  },
  editButton: {
    flex: 1,
  },
  deleteButton: {
    flex: 1,
    borderColor: Colors.error,
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
  rfidSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.gray200,
  },
  rfidSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.gray900,
    marginBottom: 12,
    textAlign: "center",
  },
  rfidStatus: {
    backgroundColor: Colors.gray50,
    padding: 8,
    borderRadius: 6,
    marginBottom: 12,
  },
  rfidStatusText: {
    fontSize: 12,
    color: Colors.gray600,
    textAlign: "center",
  },
  rfidPairingContainer: {
    alignItems: "center",
    paddingVertical: 8,
  },
  rfidActions: {
    flexDirection: "row",
    gap: 8,
  },
  rfidButton: {
    flex: 1,
  },
  removeRfidButton: {
    borderColor: Colors.error,
  },
  cancelRfidButton: {
    marginTop: 12,
    minWidth: 100,
  },
});
