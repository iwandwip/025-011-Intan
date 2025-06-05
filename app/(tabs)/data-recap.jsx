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
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../contexts/AuthContext";
import Button from "../../components/ui/Button";
import DataTable from "../../components/ui/DataTable";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import EditMeasurementModal from "../../components/ui/EditMeasurementModal";
import {
  getUserMeasurements,
  generateRandomData,
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
  const [generating, setGenerating] = useState(false);
  const [sortOrder, setSortOrder] = useState("desc");
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedMeasurement, setSelectedMeasurement] = useState(null);

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

  const handleGenerateData = async () => {
    if (!userProfile?.id) return;

    Alert.alert(
      "Generate Random Data",
      "This will add 5 random measurement records. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Generate",
          onPress: async () => {
            setGenerating(true);
            try {
              const result = await generateRandomData(userProfile.id);
              if (result.success) {
                Alert.alert(
                  "Success",
                  "5 random measurement records have been generated!"
                );
                await loadMeasurements();
              } else {
                Alert.alert("Error", result.error);
              }
            } catch (error) {
              Alert.alert(
                "Error",
                "Failed to generate data. Please try again."
              );
            } finally {
              setGenerating(false);
            }
          },
        },
      ]
    );
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
      "Delete Measurement",
      "Are you sure you want to delete this measurement record?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const result = await deleteMeasurement(
                userProfile.id,
                measurement.id
              );
              if (result.success) {
                Alert.alert("Success", "Measurement deleted successfully!");
                await loadMeasurements();
              } else {
                Alert.alert("Error", result.error);
              }
            } catch (error) {
              Alert.alert("Error", "Failed to delete measurement.");
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
        Alert.alert("Success", "Measurement updated successfully!");
        setEditModalVisible(false);
        setSelectedMeasurement(null);
        await loadMeasurements();
      } else {
        Alert.alert("Error", result.error);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to update measurement.");
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
    return date.toLocaleDateString("en-US", {
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
    nutritionStatus: item.nutritionStatus,
  }));

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor={Colors.background}
        />
        <LoadingSpinner text="Loading measurements..." />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      <View style={styles.header}>
        <Text style={styles.title}>Data Recap</Text>
        <Text style={styles.subtitle}>Measurement History</Text>
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
          <Button
            title={generating ? "Generating..." : "Generate Random Data"}
            onPress={handleGenerateData}
            style={styles.generateButton}
            disabled={generating}
          />

          <View style={styles.sortContainer}>
            <Text style={styles.sortLabel}>Sort by Date:</Text>
            <TouchableOpacity
              style={styles.sortButton}
              onPress={handleSortToggle}
            >
              <Text style={styles.sortButtonText}>
                {sortOrder === "desc" ? "Newest First ↓" : "Oldest First ↑"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.tableContainer}>
          {tableData.length > 0 ? (
            <DataTable
              headers={["Date & Time", "Weight", "Height", "Status", "Actions"]}
              data={tableData}
              onEdit={handleEdit}
              onDelete={handleDelete}
              keyExtractor={(item, index) => `measurement-${index}`}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No measurement data found</Text>
              <Text style={styles.emptySubtext}>
                Generate some random data or take measurements to see records
                here
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
  actionsContainer: {
    marginBottom: 24,
  },
  generateButton: {
    marginBottom: 16,
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
});
