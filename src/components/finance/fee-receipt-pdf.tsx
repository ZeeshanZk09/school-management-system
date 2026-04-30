"use client";

import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { format } from "date-fns";

// Standard styles for the receipt
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
    borderBottomColor: "#3b82f6",
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
  address: {
    fontSize: 9,
    color: "#64748b",
    lineHeight: 1.4,
  },
  receiptTitle: {
    fontSize: 24,
    fontWeight: "black",
    color: "#3b82f6",
    textAlign: "right",
  },
  infoSection: {
    flexDirection: "row",
    marginBottom: 30,
    gap: 20,
  },
  infoBox: {
    flex: 1,
    backgroundColor: "#f8fafc",
    padding: 12,
    borderRadius: 8,
  },
  label: {
    fontSize: 8,
    color: "#94a3b8",
    textTransform: "uppercase",
    marginBottom: 4,
    fontWeight: "bold",
  },
  value: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#1e293b",
  },
  table: {
    marginTop: 20,
    width: "auto",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#334155",
    color: "white",
    padding: 8,
    borderRadius: 4,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    padding: 8,
  },
  col1: { flex: 3 },
  col2: { flex: 1, textAlign: "right" },
  totalSection: {
    marginTop: 30,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  totalBox: {
    width: 200,
    backgroundColor: "#3b82f6",
    color: "white",
    padding: 15,
    borderRadius: 12,
  },
  totalLabel: {
    fontSize: 10,
    opacity: 0.8,
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: "bold",
  },
  footer: {
    position: "absolute",
    bottom: 40,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    paddingTop: 10,
    textAlign: "center",
    fontSize: 8,
    color: "#94a3b8",
  },
});

export function FeeReceiptPDF({ payment, settings, student, enrollment }: any) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.schoolInfo}>
            <Text style={styles.schoolName}>{settings.schoolName}</Text>
            <Text style={styles.address}>{settings.addressLine1}</Text>
            {settings.addressLine2 && (
              <Text style={styles.address}>{settings.addressLine2}</Text>
            )}
            <Text style={styles.address}>
              {settings.city}, {settings.state} {settings.postalCode}
            </Text>
            <Text style={styles.address}>
              Email: {settings.contactEmail} | Phone: {settings.contactPhone}
            </Text>
          </View>
          <View>
            <Text style={styles.receiptTitle}>FEE RECEIPT</Text>
            <Text style={{ textAlign: "right", fontSize: 10, marginTop: 4 }}>
              # {payment.receipt?.id.toString().padStart(6, "0")}
            </Text>
          </View>
        </View>

        {/* Student & Payment Details */}
        <View style={styles.infoSection}>
          <View style={styles.infoBox}>
            <Text style={styles.label}>Student Details</Text>
            <Text style={styles.value}>{student.fullName}</Text>
            <Text style={{ fontSize: 9, marginTop: 2 }}>
              Roll #: {enrollment.rollNumber}
            </Text>
            <Text style={{ fontSize: 9 }}>
              Class: {enrollment.class.name} - {enrollment.section?.name}
            </Text>
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.label}>Payment Details</Text>
            <Text style={styles.value}>
              {format(new Date(payment.paidAt), "PPPP")}
            </Text>
            <Text style={{ fontSize: 9, marginTop: 2 }}>
              Method: {payment.method}
            </Text>
            <Text style={{ fontSize: 9 }}>
              Reference: {payment.referenceNumber || "N/A"}
            </Text>
          </View>
        </View>

        {/* Breakdown Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.col1}>Description</Text>
            <Text style={styles.col2}>Amount</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.col1}>
              {payment.feeRecord.feeStructure.name}
            </Text>
            <Text style={styles.col2}>
              Rs {Number.parseFloat(payment.amountPaid).toLocaleString()}
            </Text>
          </View>
          {payment.note && (
            <View style={{ marginTop: 10, padding: 8 }}>
              <Text style={styles.label}>Note</Text>
              <Text style={{ fontSize: 9, fontStyle: "italic" }}>
                {payment.note}
              </Text>
            </View>
          )}
        </View>

        {/* Total */}
        <View style={styles.totalSection}>
          <View style={styles.totalBox}>
            <Text style={styles.totalLabel}>Total Amount Paid</Text>
            <Text style={styles.totalAmount}>
              Rs {Number.parseFloat(payment.amountPaid).toLocaleString()}
            </Text>
          </View>
        </View>

        <View style={{ marginTop: 50 }}>
          <Text style={{ fontSize: 10, fontWeight: "bold", marginBottom: 20 }}>
            Authorized Signature
          </Text>
          <View
            style={{
              width: 150,
              borderBottomWidth: 1,
              borderBottomColor: "#334155",
            }}
          />
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Computer generated receipt. Generated on {format(new Date(), "PPpp")}
        </Text>
      </Page>
    </Document>
  );
}
