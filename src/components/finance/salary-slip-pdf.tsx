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
    borderBottomWidth: 2,
    borderBottomColor: "#10b981",
    paddingBottom: 20,
    marginBottom: 20,
  },
  schoolInfo: {
    flex: 1,
  },
  schoolName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 4,
  },
  slipTitle: {
    fontSize: 20,
    fontWeight: "black",
    color: "#10b981",
    textAlign: "right",
  },
  period: {
    textAlign: "right",
    fontSize: 12,
    color: "#64748b",
    fontWeight: "bold",
  },
  detailsSection: {
    flexDirection: "row",
    marginBottom: 20,
    gap: 40,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    paddingBottom: 20,
  },
  col: {
    flex: 1,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  label: {
    color: "#94a3b8",
    fontSize: 8,
    textTransform: "uppercase",
  },
  value: {
    fontWeight: "bold",
  },
  table: {
    flexDirection: "row",
    gap: 20,
  },
  tableCol: {
    flex: 1,
  },
  tableHeader: {
    backgroundColor: "#f8fafc",
    padding: 8,
    fontWeight: "bold",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  tableRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  summary: {
    marginTop: 40,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  summaryBox: {
    width: 250,
    backgroundColor: "#10b981",
    color: "white",
    padding: 20,
    borderRadius: 12,
  },
  netPay: {
    fontSize: 24,
    fontWeight: "bold",
  },
});

export function SalarySlipPDF({ slip, staff, settings }: any) {
  const monthName = format(
    new Date(slip.periodYear, slip.periodMonth - 1),
    "MMMM yyyy",
  );

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.schoolInfo}>
            <Text style={styles.schoolName}>{settings.schoolName}</Text>
            <Text style={{ fontSize: 9, color: "#64748b" }}>
              {settings.addressLine1}
            </Text>
            <Text style={{ fontSize: 9, color: "#64748b" }}>
              {settings.contactEmail} | {settings.contactPhone}
            </Text>
          </View>
          <View>
            <Text style={styles.slipTitle}>SALARY SLIP</Text>
            <Text style={styles.period}>{monthName}</Text>
          </View>
        </View>

        {/* Staff Details */}
        <View style={styles.detailsSection}>
          <View style={styles.col}>
            <View style={styles.row}>
              <Text style={styles.label}>Employee Name</Text>
              <Text style={styles.value}>{staff.fullName}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Employee ID</Text>
              <Text style={styles.value}>{staff.staffNumber}</Text>
            </View>
          </View>
          <View style={styles.col}>
            <View style={styles.row}>
              <Text style={styles.label}>Designation</Text>
              <Text style={styles.value}>{staff.designation}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Department</Text>
              <Text style={styles.value}>{staff.department}</Text>
            </View>
          </View>
        </View>

        {/* Components Table */}
        <View style={styles.table}>
          {/* Earnings */}
          <View style={styles.tableCol}>
            <Text style={styles.tableHeader}>EARNINGS</Text>
            <View style={styles.tableRow}>
              <Text>Base Salary</Text>
              <Text>
                ${parseFloat(slip.salaryStructure.basePay).toLocaleString()}
              </Text>
            </View>
            {slip.salaryStructure.components
              .filter((c: any) => c.type === "ALLOWANCE")
              .map((c: any) => (
                <View key={c.id} style={styles.tableRow}>
                  <Text>{c.label}</Text>
                  <Text>${parseFloat(c.amount).toLocaleString()}</Text>
                </View>
              ))}
            <View
              style={[styles.tableRow, { borderBottomWidth: 0, marginTop: 10 }]}
            >
              <Text style={{ fontWeight: "bold" }}>Gross Pay</Text>
              <Text style={{ fontWeight: "bold" }}>
                ${parseFloat(slip.grossPay).toLocaleString()}
              </Text>
            </View>
          </View>

          {/* Deductions */}
          <View style={styles.tableCol}>
            <Text style={styles.tableHeader}>DEDUCTIONS</Text>
            {slip.salaryStructure.components
              .filter((c: any) => c.type === "DEDUCTION")
              .map((c: any) => (
                <View key={c.id} style={styles.tableRow}>
                  <Text>{c.label}</Text>
                  <Text>${parseFloat(c.amount).toLocaleString()}</Text>
                </View>
              ))}
            <View
              style={[styles.tableRow, { borderBottomWidth: 0, marginTop: 10 }]}
            >
              <Text style={{ fontWeight: "bold" }}>Total Deductions</Text>
              <Text style={{ fontWeight: "bold" }}>
                ${parseFloat(slip.totalDeductions).toLocaleString()}
              </Text>
            </View>
          </View>
        </View>

        {/* Summary */}
        <View style={styles.summary}>
          <View style={styles.summaryBox}>
            <Text style={{ fontSize: 10, opacity: 0.9 }}>NET PAYABLE</Text>
            <Text style={styles.netPay}>
              ${parseFloat(slip.netPay).toLocaleString()}
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={{ position: "absolute", bottom: 40, left: 40, right: 40 }}>
          <Text style={{ textAlign: "center", color: "#94a3b8", fontSize: 8 }}>
            This is a computer generated salary slip and does not require a
            physical signature.
          </Text>
        </View>
      </Page>
    </Document>
  );
}
