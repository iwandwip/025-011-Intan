import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Colors } from "../../constants/Colors";

const DataTable = ({ headers, data, onEdit, onDelete, keyExtractor }) => {
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "gizi buruk":
        return "#B91C1C"; // Dark red
      case "gizi kurang":
        return "#EA580C"; // Orange
      case "gizi baik":
        return "#16A34A"; // Green
      case "overweight":
        return "#F59E0B"; // Light orange/amber
      case "obesitas":
        return "#DC2626"; // Red
      // Legacy support for old status values
      case "sehat":
        return "#16A34A"; // Green
      case "tidak sehat":
        return "#EA580C"; // Orange
      default:
        return Colors.gray700;
    }
  };

  const renderActionButtons = (item, rowIndex) => {
    const originalItem = data[rowIndex];

    return (
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => onEdit && onEdit(originalItem)}
        >
          <Text style={styles.editButtonText}>✏️</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => onDelete && onDelete(originalItem)}
        >
          <Text style={styles.deleteButtonText}>🗑️</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.table}>
          <View style={styles.headerRow}>
            {headers.map((header, index) => (
              <View
                key={index}
                style={[styles.headerCell, styles[`column${index}`]]}
              >
                <Text style={styles.headerText}>{header}</Text>
              </View>
            ))}
          </View>

          {data.map((row, rowIndex) => (
            <View
              key={keyExtractor ? keyExtractor(row, rowIndex) : rowIndex}
              style={[
                styles.dataRow,
                rowIndex % 2 === 0 ? styles.evenRow : styles.oddRow,
              ]}
            >
              <View style={[styles.dataCell, styles.column0]}>
                <Text style={styles.cellText}>{row.dateTime}</Text>
              </View>
              <View style={[styles.dataCell, styles.column1]}>
                <Text style={styles.cellText}>
                  {row.ageYears !== undefined ? `${row.ageYears}` : 'N/A'}
                </Text>
              </View>
              <View style={[styles.dataCell, styles.column2]}>
                <Text style={styles.cellText}>
                  {row.ageMonths !== undefined ? `${row.ageMonths}` : 'N/A'}
                </Text>
              </View>
              <View style={[styles.dataCell, styles.column3]}>
                <Text style={styles.cellText}>
                  {row.gender === 'male' ? 'L' : row.gender === 'female' ? 'P' : 'N/A'}
                </Text>
              </View>
              <View style={[styles.dataCell, styles.column4]}>
                <Text style={styles.cellText}>{row.weight}</Text>
              </View>
              <View style={[styles.dataCell, styles.column5]}>
                <Text style={styles.cellText}>{row.height}</Text>
              </View>
              <View style={[styles.dataCell, styles.column6]}>
                <Text style={styles.cellText}>
                  {row.imt !== undefined ? row.imt.toFixed(1) : 'N/A'}
                </Text>
              </View>
              <View style={[styles.dataCell, styles.column7]}>
                <Text style={styles.cellText}>
                  {row.eatingPattern || 'N/A'}
                </Text>
              </View>
              <View style={[styles.dataCell, styles.column8]}>
                <Text style={styles.cellText}>
                  {row.childResponse || 'N/A'}
                </Text>
              </View>
              <View style={[styles.dataCell, styles.column9]}>
                <Text
                  style={[
                    styles.cellText,
                    styles.statusText,
                    { color: getStatusColor(row.nutritionStatus) },
                  ]}
                >
                  {row.nutritionStatus}
                </Text>
              </View>
              <View style={[styles.dataCell, styles.column10]}>
                {renderActionButtons(row, rowIndex)}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.gray200,
    overflow: "hidden",
  },
  table: {
    minWidth: "100%",
  },
  headerRow: {
    flexDirection: "row",
    backgroundColor: Colors.gray50,
    borderBottomWidth: 2,
    borderBottomColor: Colors.gray200,
  },
  headerCell: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    justifyContent: "center",
    alignItems: "center",
    borderRightWidth: 1,
    borderRightColor: Colors.gray200,
  },
  headerText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.gray900,
    textAlign: "center",
  },
  dataRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },
  evenRow: {
    backgroundColor: Colors.white,
  },
  oddRow: {
    backgroundColor: Colors.gray25,
  },
  dataCell: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    justifyContent: "center",
    alignItems: "center",
    borderRightWidth: 1,
    borderRightColor: Colors.gray100,
  },
  cellText: {
    fontSize: 13,
    color: Colors.gray700,
    textAlign: "center",
  },
  statusText: {
    fontWeight: "500",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 4,
  },
  actionButton: {
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  editButton: {
    backgroundColor: Colors.primary,
  },
  deleteButton: {
    backgroundColor: Colors.error,
  },
  editButtonText: {
    fontSize: 14,
  },
  deleteButtonText: {
    fontSize: 14,
  },
  column0: {
    width: 130,  // Tanggal & Waktu
  },
  column1: {
    width: 50,   // Usia (tahun)
  },
  column2: {
    width: 50,   // Usia (bulan)
  },
  column3: {
    width: 70,   // Jenis Kelamin
  },
  column4: {
    width: 60,   // Berat Badan (kg)
  },
  column5: {
    width: 60,   // Tinggi Badan (cm)
  },
  column6: {
    width: 50,   // IMT
  },
  column7: {
    width: 80,   // Pola Makan
  },
  column8: {
    width: 80,   // Respon Anak
  },
  column9: {
    width: 100,  // Status Gizi
  },
  column10: {
    width: 90,   // Actions
  },
});

export default DataTable;
