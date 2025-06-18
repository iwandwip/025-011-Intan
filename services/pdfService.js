import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { formatAge } from '../utils/ageCalculator';

const generateUserProfileHTML = (user) => {
  const formatDate = (dateString) => {
    if (!dateString) return "Belum diatur";
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID");
  };

  return `
    <div style="margin-bottom: 30px; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; background-color: #f9fafb;">
      <h3 style="margin: 0 0 15px 0; color: #374151; text-align: center; border-bottom: 2px solid #7C3AED; padding-bottom: 10px;">
        Profil Siswa: ${user.name}
      </h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px; font-weight: 500; color: #6b7280; width: 30%;">Nama:</td>
          <td style="padding: 8px; color: #374151;">${user.name}</td>
        </tr>
        <tr style="background-color: #ffffff;">
          <td style="padding: 8px; font-weight: 500; color: #6b7280;">Umur:</td>
          <td style="padding: 8px; color: #374151;">${formatAge(user.birthdate)}</td>
        </tr>
        <tr>
          <td style="padding: 8px; font-weight: 500; color: #6b7280;">Jenis Kelamin:</td>
          <td style="padding: 8px; color: #374151;">${user.gender === "male" ? "Laki-laki" : user.gender === "female" ? "Perempuan" : "Belum diatur"}</td>
        </tr>
        <tr style="background-color: #ffffff;">
          <td style="padding: 8px; font-weight: 500; color: #6b7280;">Tanggal Lahir:</td>
          <td style="padding: 8px; color: #374151;">${formatDate(user.birthdate)}</td>
        </tr>
        <tr>
          <td style="padding: 8px; font-weight: 500; color: #6b7280;">Umur:</td>
          <td style="padding: 8px; color: #374151;">${formatAge(user.birthdate)}</td>
        </tr>
        <tr style="background-color: #ffffff;">
          <td style="padding: 8px; font-weight: 500; color: #6b7280;">Orang Tua:</td>
          <td style="padding: 8px; color: #374151;">${user.parentName}</td>
        </tr>
        <tr>
          <td style="padding: 8px; font-weight: 500; color: #6b7280;">RFID:</td>
          <td style="padding: 8px; color: #374151;">${user.rfid || "Belum dipasang"}</td>
        </tr>
      </table>
    </div>
  `;
};

const generateMeasurementsTableHTML = (measurements) => {
  if (!measurements || measurements.length === 0) {
    return `
      <div style="margin-bottom: 40px; padding: 20px; text-align: center; color: #6b7280; background-color: #f9fafb; border-radius: 8px;">
        <p>Tidak ada data pengukuran</p>
      </div>
    `;
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "sehat":
        return "#10b981";
      case "tidak sehat":
        return "#f59e0b";
      case "obesitas":
        return "#ef4444";
      default:
        return "#374151";
    }
  };

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

  const tableRows = measurements.map((measurement, index) => `
    <tr style="background-color: ${index % 2 === 0 ? '#ffffff' : '#f9fafb'};">
      <td style="padding: 10px; border: 1px solid #e5e7eb; text-align: center; font-size: 10px;">${formatDateTime(measurement.dateTime)}</td>
      <td style="padding: 10px; border: 1px solid #e5e7eb; text-align: center; font-size: 10px;">${measurement.ageYears || 'N/A'}</td>
      <td style="padding: 10px; border: 1px solid #e5e7eb; text-align: center; font-size: 10px;">${measurement.ageMonths || 'N/A'}</td>
      <td style="padding: 10px; border: 1px solid #e5e7eb; text-align: center; font-size: 10px;">
        ${measurement.gender === 'male' ? 'L' : measurement.gender === 'female' ? 'P' : 'N/A'}
      </td>
      <td style="padding: 10px; border: 1px solid #e5e7eb; text-align: center; font-size: 10px;">${measurement.weight} kg</td>
      <td style="padding: 10px; border: 1px solid #e5e7eb; text-align: center; font-size: 10px;">${measurement.height} cm</td>
      <td style="padding: 10px; border: 1px solid #e5e7eb; text-align: center; font-size: 10px;">${measurement.imt ? measurement.imt.toFixed(1) : 'N/A'}</td>
      <td style="padding: 10px; border: 1px solid #e5e7eb; text-align: center; font-size: 10px;">${measurement.eatingPattern || 'N/A'}</td>
      <td style="padding: 10px; border: 1px solid #e5e7eb; text-align: center; font-size: 10px;">${measurement.childResponse || 'N/A'}</td>
      <td style="padding: 10px; border: 1px solid #e5e7eb; text-align: center; color: ${getStatusColor(measurement.nutritionStatus)}; font-weight: 500; font-size: 10px;">
        ${measurement.nutritionStatus}
      </td>
    </tr>
  `).join('');

  return `
    <div style="margin-bottom: 40px;">
      <h4 style="margin: 0 0 15px 0; color: #374151; text-align: center;">Riwayat Pengukuran</h4>
      <table style="width: 100%; border-collapse: collapse; border: 1px solid #e5e7eb;">
        <thead>
          <tr style="background-color: #7C3AED; color: white;">
            <th style="padding: 10px; border: 1px solid #e5e7eb; text-align: center; font-size: 10px;">Tanggal & Waktu</th>
            <th style="padding: 10px; border: 1px solid #e5e7eb; text-align: center; font-size: 10px;">Usia (th)</th>
            <th style="padding: 10px; border: 1px solid #e5e7eb; text-align: center; font-size: 10px;">Usia (bl)</th>
            <th style="padding: 10px; border: 1px solid #e5e7eb; text-align: center; font-size: 10px;">Gender</th>
            <th style="padding: 10px; border: 1px solid #e5e7eb; text-align: center; font-size: 10px;">Berat (kg)</th>
            <th style="padding: 10px; border: 1px solid #e5e7eb; text-align: center; font-size: 10px;">Tinggi (cm)</th>
            <th style="padding: 10px; border: 1px solid #e5e7eb; text-align: center; font-size: 10px;">IMT</th>
            <th style="padding: 10px; border: 1px solid #e5e7eb; text-align: center; font-size: 10px;">Pola Makan</th>
            <th style="padding: 10px; border: 1px solid #e5e7eb; text-align: center; font-size: 10px;">Respon Anak</th>
            <th style="padding: 10px; border: 1px solid #e5e7eb; text-align: center; font-size: 10px;">Status Gizi</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
    </div>
  `;
};

export const generateAllUsersPDF = async (usersWithMeasurements) => {
  try {
    const currentDate = new Date().toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    let contentHTML = '';

    usersWithMeasurements.forEach((userData) => {
      contentHTML += generateUserProfileHTML(userData.user);
      contentHTML += generateMeasurementsTableHTML(userData.measurements);
    });

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Laporan Data Siswa</title>
          <style>
            body {
              font-family: 'Arial', sans-serif;
              margin: 20px;
              color: #374151;
              line-height: 1.4;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              padding-bottom: 20px;
              border-bottom: 3px solid #7C3AED;
            }
            .header h1 {
              color: #7C3AED;
              margin: 0 0 10px 0;
              font-size: 24px;
            }
            .header p {
              margin: 0;
              color: #6b7280;
              font-size: 14px;
            }
            @media print {
              body { margin: 15px; }
              .page-break { page-break-before: always; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>📊 Laporan Data Siswa</h1>
            <p>Sistem Monitoring Gizi Anak</p>
            <p>Digenerate pada: ${currentDate}</p>
          </div>
          ${contentHTML}
        </body>
      </html>
    `;

    const { uri } = await Print.printToFileAsync({
      html,
      base64: false,
    });

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Bagikan Laporan Data Siswa',
        UTI: 'com.adobe.pdf',
      });
    }

    return { success: true, uri };
  } catch (error) {
    return { success: false, error: error.message };
  }
};