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
import { formatAge } from "../../utils/ageCalculator";
import { Colors } from "../../constants/Colors";

function Home() {
  const { currentUser, userProfile } = useAuth();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
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

  const handleEditProfile = () => {
    router.push("/(tabs)/edit-profile");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Belum diatur";
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID");
  };

  const getWelcomeMessage = () => {
    if (userProfile?.name) {
      return `Selamat Datang ${userProfile.name}!`;
    }
    return "Selamat Datang!";
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
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

          {userProfile ? (
            <View style={styles.profileContainer}>
              <View style={styles.profileCard}>
                <Text style={styles.cardTitle}>Profil Anak</Text>

                <View style={styles.profileRow}>
                  <Text style={styles.label}>Nama:</Text>
                  <Text style={styles.value}>{userProfile.name}</Text>
                </View>

                <View style={styles.profileRow}>
                  <Text style={styles.label}>Umur:</Text>
                  <Text style={styles.value}>
                    {formatAge(userProfile.birthdate)}
                  </Text>
                </View>

                <View style={styles.profileRow}>
                  <Text style={styles.label}>Jenis Kelamin:</Text>
                  <Text style={styles.value}>
                    {userProfile.gender === "male"
                      ? "Laki-laki"
                      : userProfile.gender === "female"
                      ? "Perempuan"
                      : "Belum diatur"}
                  </Text>
                </View>

                <View style={styles.profileRow}>
                  <Text style={styles.label}>Tanggal Lahir:</Text>
                  <Text style={styles.value}>
                    {formatDate(userProfile.birthdate)}
                  </Text>
                </View>

                <View style={styles.profileRow}>
                  <Text style={styles.label}>Orang Tua:</Text>
                  <Text style={styles.value}>{userProfile.parentName}</Text>
                </View>

                <View style={styles.profileRow}>
                  <Text style={styles.label}>RFID:</Text>
                  <Text
                    style={[styles.value, !userProfile.rfid && styles.notSet]}
                  >
                    {userProfile.rfid 
                      ? `${userProfile.rfid}${userProfile.rfidNumber ? ` (No. ${userProfile.rfidNumber})` : ''}` 
                      : "Belum dipasang"}
                  </Text>
                </View>

                <View style={styles.profileRow}>
                  <Text style={styles.label}>Peran:</Text>
                  <Text style={styles.value}>{userProfile.role}</Text>
                </View>
              </View>

              <View style={styles.accountCard}>
                <Text style={styles.cardTitle}>Informasi Akun</Text>

                <View style={styles.profileRow}>
                  <Text style={styles.label}>Email:</Text>
                  <Text style={styles.value}>{currentUser?.email}</Text>
                </View>

                <View style={styles.profileRow}>
                  <Text style={styles.label}>User ID:</Text>
                  <Text style={styles.value}>{userProfile.id}</Text>
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Memuat...</Text>
            </View>
          )}

          <View style={styles.actionsContainer}>
            <Button
              title="Ubah Profil"
              onPress={handleEditProfile}
              style={styles.editButton}
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
  accountCard: {
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
  notSet: {
    color: Colors.gray400,
    fontStyle: "italic",
  },
  loadingContainer: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 32,
    alignItems: "center",
    marginBottom: 32,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.gray500,
  },
  actionsContainer: {
    gap: 12,
  },
  editButton: {
    marginBottom: 8,
  },
  logoutButton: {
    marginBottom: 8,
  },
});

export default Home;
