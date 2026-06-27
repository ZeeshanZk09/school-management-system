"use client";

import { Text, View, StyleSheet, Image } from "@react-pdf/renderer";
import { format } from "date-fns";

// Register fonts if needed (Standard fonts are used here for simplicity)
// Font.register({ family: 'Inter', src: '...' });

export const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#334155", // slate-700
  },
  header: {
    marginBottom: 20,
    borderBottom: 1,
    borderBottomColor: "#E2E8F0",
    paddingBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  schoolInfo: {
    flexDirection: "column",
  },
  schoolName: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    color: "#0F172A", // slate-900
    marginBottom: 4,
  },
  schoolDetails: {
    fontSize: 8,
    color: "#64748B", // slate-500
    marginBottom: 2,
  },
  logo: {
    width: 50,
    height: 50,
  },
  titleContainer: {
    marginVertical: 20,
    textAlign: "center",
  },
  reportTitle: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  reportSubtitle: {
    fontSize: 10,
    color: "#64748B",
    marginTop: 4,
  },
  footer: {
    position: "absolute",
    bottom: 40,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    paddingTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 8,
    color: "#64748B",
  },
  table: {
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRightWidth: 0,
    borderBottomWidth: 0,
    marginTop: 15,
  },
  tableRow: {
    margin: "auto",
    flexDirection: "row",
  },
  tableHeader: {
    backgroundColor: "#F8FAFC",
  },
  tableCell: {
    flex: 1,
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 8,
  },
  tableHeaderText: {
    fontFamily: "Helvetica-Bold",
    fontSize: 9,
  },
  summaryGrid: {
    flexDirection: "row",
    marginTop: 20,
    gap: 10,
  },
  summaryCard: {
    flex: 1,
    padding: 10,
    backgroundColor: "#F8FAFC",
    borderRadius: 4,
  },
  summaryLabel: {
    fontSize: 8,
    color: "#64748B",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: "#1E293B",
  },
});

export type PDFSettings = {
  schoolName: string;
  address: string;
  logoUrl?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
};

export function PDFHeader({
  settings,
  title: _title,
  subtitle: _subtitle,
}: {
  settings: PDFSettings;
  title: string;
  subtitle?: string;
}) {
  return (
    <View style={styles.header}>
      <View style={styles.schoolInfo}>
        <Text style={styles.schoolName}>{settings.schoolName}</Text>
        <Text style={styles.schoolDetails}>{settings.address}</Text>
        {(settings.contactEmail || settings.contactPhone) && (
          <Text style={styles.schoolDetails}>
            {[settings.contactEmail, settings.contactPhone].filter(Boolean).join(" | ")}
          </Text>
        )}
      </View>
      {settings.logoUrl && <Image src={settings.logoUrl} style={styles.logo} />}
    </View>
  );
}

export function PDFFooter() {
  return (
    <View style={styles.footer} fixed>
      <Text>Generated on {format(new Date(), "PPPpp")}</Text>
      <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
    </View>
  );
}

export function PDFTable({ headers, data }: { headers: string[]; data: (string | number)[][] }) {
  return (
    <View style={styles.table}>
      <View style={[styles.tableRow, styles.tableHeader]}>
        {headers.map((header, i) => (
          <View key={i} style={styles.tableCell}>
            <Text style={styles.tableHeaderText}>{header}</Text>
          </View>
        ))}
      </View>
      {data.map((row, i) => (
        <View key={i} style={styles.tableRow}>
          {row.map((cell, j) => (
            <View key={j} style={styles.tableCell}>
              <Text>{cell}</Text>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}
