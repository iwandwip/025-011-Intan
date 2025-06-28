import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  StatusBar,
  RefreshControl,
  TouchableOpacity,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../contexts/AuthContext";
import Button from "../../components/ui/Button";
import DataTable from "../../components/ui/DataTable";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import EditMeasurementModal from "../../components/ui/EditMeasurementModal";
import NutritionStatusHelpModal from "../../components/ui/NutritionStatusHelpModal";
import Input from "../../components/ui/Input";
import {
  getUserMeasurements,
  deleteMeasurement,
  updateMeasurement,
} from "../../services/dataService";
import { Colors } from "../../constants/Colors";

export default function DataRecap() {
  const { userProfile } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [measurements, setMeasurements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sortOrder, setSortOrder] = useState("desc");
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedMeasurement, setSelectedMeasurement] = useState(null);
  const [helpModalVisible, setHelpModalVisible] = useState(false);

  const loadMeasurements = async () => {
    if (!userProfile?.id) return;

    try {
      const result = await getUserMeasurements(userProfile.id);
      if (result.success) {
        setMeasurements(result.data);
      } else {
        console.error("Failed to load measurements:", result.error);
      }
    } catch (error) {
      console.error("Error loading measurements:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadMeasurements();
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

  const handleEdit = (measurement) => {
    setSelectedMeasurement(measurement);
    setEditModalVisible(true);
  };

  const handleDelete = (measurement) => {
    Alert.alert(
      "Hapus Pengukuran",
      "Apakah Anda yakin ingin menghapus data pengukuran ini?",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus",
          style: "destructive",
          onPress: async () => {
            try {
              const result = await deleteMeasurement(
                userProfile.id,
                measurement.id
              );
              if (result.success) {
                Alert.alert("Berhasil", "Pengukuran berhasil dihapus!");
                await loadMeasurements();
              } else {
                Alert.alert("Kesalahan", result.error);
              }
            } catch (error) {
              Alert.alert("Kesalahan", "Gagal menghapus pengukuran.");
            }
          },
        },
      ]
    );
  };

  const handleUpdateMeasurement = async (updatedData) => {
    try {
      const result = await updateMeasurement(
        userProfile.id,
        selectedMeasurement.id,
        updatedData
      );

      if (result.success) {
        Alert.alert("Berhasil", "Pengukuran berhasil diperbarui!");
        setEditModalVisible(false);
        setSelectedMeasurement(null);
        await loadMeasurements();
      } else {
        Alert.alert("Kesalahan", result.error);
      }
    } catch (error) {
      Alert.alert("Kesalahan", "Gagal memperbarui pengukuran.");
    }
  };

  const handleBackToHome = () => {
    router.back();
  };

  useEffect(() => {
    loadMeasurements();
  }, [userProfile?.id]);

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

  const tableData = measurements.map((item) => ({
    ...item,
    dateTime: formatDateTime(item.dateTime),
    weight: `${item.weight} kg`,
    height: `${item.height} cm`,
    imt: item.imt || 0,
    eatingPattern: item.eatingPattern || 'N/A',
    childResponse: item.childResponse || 'N/A',
    nutritionStatus: item.nutritionStatus,
  }));

  if (loading) {
    return (
      <>
        <View style={[styles.container, { paddingTop: insets.top }]}>
          <StatusBar
            barStyle="dark-content"
            backgroundColor={Colors.background}
          />
          
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <View style={styles.titleContainer}>
                <Text style={styles.title}>Rekap Data</Text>
                <Text style={styles.subtitle}>Riwayat Pengukuran</Text>
              </View>
              <TouchableOpacity
                style={styles.helpButton}
                onPress={() => {
                  console.log('Help button pressed, setting modal visible');
                  setHelpModalVisible(true);
                }}
              >
                <Text style={styles.helpButtonText}>?</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.loadingContainer}>
            <LoadingSpinner text="Memuat pengukuran..." />
          </View>
        </View>
        
        {/* Modal bantuan di luar container utama untuk memastikan berada di atas tab bar */}
        <NutritionStatusHelpModal
          visible={helpModalVisible}
          onClose={() => setHelpModalVisible(false)}
        />
      </>
    );
  }

  return (
    <>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>Rekap Data</Text>
              <Text style={styles.subtitle}>Riwayat Pengukuran</Text>
            </View>
            <TouchableOpacity
              style={styles.helpButton}
              onPress={() => {
                console.log('Help button pressed (main view), setting modal visible');
                setHelpModalVisible(true);
              }}
            >
              <Text style={styles.helpButtonText}>?</Text>
            </TouchableOpacity>
          </View>
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
          <View style={styles.actionsContainer}>
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
          </View>

          <View style={styles.tableContainer}>
            {tableData.length > 0 ? (
              <DataTable
                headers={["Tanggal & Waktu", "Usia (th)", "Usia (bl)", "Gender", "Berat (kg)", "Tinggi (cm)", "IMT", "Pola Makan", "Respon Anak", "Status Gizi", "Aksi"]}
                data={tableData}
                onEdit={handleEdit}
                onDelete={handleDelete}
                keyExtractor={(item, index) => `measurement-${index}`}
              />
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Tidak ada data pengukuran</Text>
                <Text style={styles.emptySubtext}>
                  Lakukan pengukuran untuk melihat rekaman di sini
                </Text>
              </View>
            )}
          </View>

          <View style={styles.backButtonContainer}>
            <Button
              title="Kembali ke Halaman Utama"
              onPress={handleBackToHome}
              variant="outline"
              style={styles.backButton}
            />
          </View>
        </ScrollView>

        <EditMeasurementModal
          visible={editModalVisible}
          measurement={selectedMeasurement}
          onClose={() => {
            setEditModalVisible(false);
            setSelectedMeasurement(null);
          }}
          onSave={handleUpdateMeasurement}
        />
      </View>

      {/* Modal bantuan di luar container utama untuk memastikan berada di atas tab bar */}
      <NutritionStatusHelpModal
        visible={helpModalVisible}
        onClose={() => setHelpModalVisible(false)}
      />

    </>
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
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  titleContainer: {
    flex: 1,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.gray900,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.gray600,
  },
  helpButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  helpButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: "bold",
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  actionsContainer: {
    marginBottom: 24,
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
  backButtonContainer: {
    marginTop: 16,
  },
  backButton: {
    marginBottom: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
