"use client";

import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { format } from "date-fns";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#334155",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "#3b82f6",
    paddingBottom: 16,
    marginBottom: 20,
  },
  schoolName: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: "#1e293b",
  },
  schoolDetails: {
    fontSize: 9,
    color: "#64748b",
    marginTop: 2,
  },
  titleBlock: {
    textAlign: "right",
  },
  reportTitle: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    color: "#3b82f6",
    textTransform: "uppercase",
  },
  reportMeta: {
    fontSize: 9,
    color: "#64748b",
    marginTop: 4,
  },
  summaryRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  summaryCard: {
    flex: 1,
    padding: 10,
    backgroundColor: "#f8fafc",
    borderRadius: 6,
  },
  summaryLabel: {
    fontSize: 8,
    color: "#94a3b8",
    textTransform: "uppercase",
    marginBottom: 3,
  },
  summaryValue: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    color: "#1e293b",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#334155",
    padding: 8,
    borderRadius: 4,
    marginBottom: 2,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    padding: 7,
  },
  tableRowWarning: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#fecaca",
    padding: 7,
    backgroundColor: "#fff5f5",
  },
  colName: { flex: 3 },
  colNum: { flex: 1, textAlign: "center" },
  colRate: { flex: 1, textAlign: "right" },
  headerText: {
    color: "white",
    fontFamily: "Helvetica-Bold",
    fontSize: 9,
  },
  warningBadge: {
    fontSize: 7,
    color: "#ef4444",
    backgroundColor: "#fee2e2",
    padding: "2 4",
    borderRadius: 3,
    marginLeft: 4,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    paddingTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 8,
    color: "#94a3b8",
  },
});

type ReportRow = {
  id: string;
  name: string;
  designation?: string;
  present: number;
  absent: number;
  late?: number;
  leave?: number;
  total: number;
  rate?: number;
  belowThreshold?: boolean;
};

export function AttendanceReportPDF({
  reportData,
  type,
  month,
  year,
  settings,
  className,
}: Readonly<{
  reportData: ReportRow[];
  type: "student" | "staff";
  month: number;
  year: number;
  settings: {
    schoolName: string;
    contactInfo: {
      email: string;
      phone: string;
    };
    reportTitle: string;
    schoolLogo?: string;
    addressLine1?: string;
    contactEmail?: string;
  };
  className?: string;
}>) {
  const monthName = format(new Date(year, month - 1), "MMMM yyyy");
  const belowThreshold = type === "student" ? reportData.filter((r) => r.belowThreshold).length : 0;
  const avgRate =
    type === "student" && reportData.length > 0
      ? Math.round(reportData.reduce((sum, r) => sum + (r.rate ?? 0), 0) / reportData.length)
      : null;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.schoolName}>{settings.schoolName}</Text>
            <Text style={styles.schoolDetails}>{settings.addressLine1}</Text>
            {settings.contactEmail && (
              <Text style={styles.schoolDetails}>{settings.contactEmail}</Text>
            )}
          </View>
          <View style={styles.titleBlock}>
            <Text style={styles.reportTitle}>
              {type === "student" ? "Student" : "Staff"} Attendance Report
            </Text>
            <Text style={styles.reportMeta}>Period: {monthName}</Text>
            {className && <Text style={styles.reportMeta}>Class: {className}</Text>}
          </View>
        </View>

        {/* Summary */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total Records</Text>
            <Text style={styles.summaryValue}>{reportData.length}</Text>
          </View>
          {type === "student" && (
            <>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>Average Rate</Text>
                <Text style={styles.summaryValue}>{avgRate}%</Text>
              </View>
              <View style={[styles.summaryCard, { backgroundColor: "#fff5f5" }]}>
                <Text style={[styles.summaryLabel, { color: "#ef4444" }]}>Below 75%</Text>
                <Text style={[styles.summaryValue, { color: "#ef4444" }]}>{belowThreshold}</Text>
              </View>
            </>
          )}
        </View>

        {/* Table Header */}
        <View style={styles.tableHeader}>
          <Text style={[styles.headerText, styles.colName]}>
            {type === "student" ? "Student Name" : "Staff Member"}
          </Text>
          <Text style={[styles.headerText, styles.colNum]}>Present</Text>
          <Text style={[styles.headerText, styles.colNum]}>Absent</Text>
          <Text style={[styles.headerText, styles.colNum]}>
            {type === "student" ? "Late" : "Leave"}
          </Text>
          <Text style={[styles.headerText, styles.colRate]}>Rate / Total</Text>
        </View>

        {/* Rows */}
        {reportData.map((row) => {
          const rateColor =
            type === "student" ? (row.belowThreshold ? "#dc2626" : "#16a34a") : "#334155";

          return (
            <View
              key={row.id}
              style={row.belowThreshold ? styles.tableRowWarning : styles.tableRow}
            >
              <View style={[styles.colName, { flexDirection: "row", alignItems: "center" }]}>
                <Text>{row.name}</Text>
                {row.belowThreshold && <Text style={styles.warningBadge}>LOW</Text>}
              </View>
              <Text style={[styles.colNum, { color: "#16a34a" }]}>{row.present}</Text>
              <Text style={[styles.colNum, { color: "#dc2626" }]}>{row.absent}</Text>
              <Text style={[styles.colNum, { color: "#d97706" }]}>
                {type === "student" ? (row.late ?? 0) : (row.leave ?? 0)}
              </Text>
              <Text
                style={[
                  styles.colRate,
                  {
                    fontFamily: "Helvetica-Bold",
                    color: rateColor,
                  },
                ]}
              >
                {type === "student" ? `${row.rate}%` : `${row.total} days`}
              </Text>
            </View>
          );
        })}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text>Generated on {format(new Date(), "PPp")}</Text>
          <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}
