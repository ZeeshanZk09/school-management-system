"use client";

import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { format } from "date-fns";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: "Helvetica", color: "#334155" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottomWidth: 2,
    borderBottomColor: "#3b82f6",
    paddingBottom: 16,
    marginBottom: 20,
  },
  schoolName: { fontSize: 18, fontFamily: "Helvetica-Bold", color: "#1e293b" },
  schoolDetails: { fontSize: 9, color: "#64748b", marginTop: 2 },
  titleBlock: { textAlign: "right" },
  reportTitle: { fontSize: 16, fontFamily: "Helvetica-Bold", color: "#3b82f6" },
  reportMeta: { fontSize: 9, color: "#64748b", marginTop: 4 },
  summaryRow: { flexDirection: "row", gap: 12, marginBottom: 20 },
  summaryCard: { flex: 1, padding: 10, backgroundColor: "#f8fafc", borderRadius: 6 },
  summaryLabel: { fontSize: 8, color: "#94a3b8", textTransform: "uppercase", marginBottom: 3 },
  summaryValue: { fontSize: 14, fontFamily: "Helvetica-Bold", color: "#1e293b" },
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
  headerText: { color: "white", fontFamily: "Helvetica-Bold", fontSize: 9 },
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

// ─── Collection Report ─────────────────────────────────────────────────────────
function CollectionTable({ data }: { data: any[] }) {
  const total = data.reduce((s, r) => s + r.amount, 0);
  return (
    <View style={{ marginTop: 4 }}>
      <View style={styles.tableHeader}>
        <Text style={[styles.headerText, { flex: 2 }]}>Date</Text>
        <Text style={[styles.headerText, { flex: 3 }]}>Student</Text>
        <Text style={[styles.headerText, { flex: 2 }]}>Class</Text>
        <Text style={[styles.headerText, { flex: 1 }]}>Method</Text>
        <Text style={[styles.headerText, { flex: 1, textAlign: "right" }]}>Amount</Text>
      </View>
      {data.map((row) => (
        <View key={row.id} style={styles.tableRow}>
          <Text style={{ flex: 2 }}>{format(new Date(row.date), "PP")}</Text>
          <Text style={{ flex: 3 }}>{row.student}</Text>
          <Text style={{ flex: 2 }}>{row.class}</Text>
          <Text style={{ flex: 1, fontSize: 8 }}>{row.method}</Text>
          <Text style={{ flex: 1, textAlign: "right", fontFamily: "Helvetica-Bold" }}>
            Rs {row.amount.toLocaleString()}
          </Text>
        </View>
      ))}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "flex-end",
          marginTop: 10,
          paddingTop: 8,
          borderTopWidth: 2,
          borderTopColor: "#334155",
        }}
      >
        <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 13, color: "#1e293b" }}>
          Total: Rs {total.toLocaleString()}
        </Text>
      </View>
    </View>
  );
}

// ─── Outstanding Report ────────────────────────────────────────────────────────
function OutstandingTable({ data }: { data: any[] }) {
  const total = data.reduce((s, r) => s + r.outstanding, 0);
  return (
    <View style={{ marginTop: 4 }}>
      <View style={styles.tableHeader}>
        <Text style={[styles.headerText, { flex: 3 }]}>Student</Text>
        <Text style={[styles.headerText, { flex: 2 }]}>Class</Text>
        <Text style={[styles.headerText, { flex: 2 }]}>Total Due</Text>
        <Text style={[styles.headerText, { flex: 2, textAlign: "right" }]}>Outstanding</Text>
      </View>
      {data.map((row) => (
        <View key={row.id} style={styles.tableRow}>
          <Text style={{ flex: 3 }}>{row.student}</Text>
          <Text style={{ flex: 2 }}>{row.class}</Text>
          <Text style={{ flex: 2 }}>Rs {row.total.toLocaleString()}</Text>
          <Text style={{ flex: 2, textAlign: "right", fontFamily: "Helvetica-Bold", color: "#dc2626" }}>
            Rs {row.outstanding.toLocaleString()}
          </Text>
        </View>
      ))}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "flex-end",
          marginTop: 10,
          paddingTop: 8,
          borderTopWidth: 2,
          borderTopColor: "#dc2626",
        }}
      >
        <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 13, color: "#dc2626" }}>
          Total Outstanding: Rs {total.toLocaleString()}
        </Text>
      </View>
    </View>
  );
}

// ─── Payroll Report ────────────────────────────────────────────────────────────
function PayrollTable({ data }: { data: any[] }) {
  const totalNet = data.reduce((s, r) => s + r.net, 0);
  const totalDisbursed = data.reduce((s, r) => s + r.disbursed, 0);
  return (
    <View style={{ marginTop: 4 }}>
      <View style={styles.tableHeader}>
        <Text style={[styles.headerText, { flex: 3 }]}>Staff</Text>
        <Text style={[styles.headerText, { flex: 2 }]}>Dept</Text>
        <Text style={[styles.headerText, { flex: 1.5 }]}>Gross</Text>
        <Text style={[styles.headerText, { flex: 1.5 }]}>Deductions</Text>
        <Text style={[styles.headerText, { flex: 1.5 }]}>Disbursed</Text>
        <Text style={[styles.headerText, { flex: 1.5, textAlign: "right" }]}>Net</Text>
      </View>
      {data.map((row) => (
        <View key={row.id} style={styles.tableRow}>
          <Text style={{ flex: 3 }}>{row.staff}</Text>
          <Text style={{ flex: 2, fontSize: 8 }}>{row.department}</Text>
          <Text style={{ flex: 1.5 }}>Rs {row.gross.toLocaleString()}</Text>
          <Text style={{ flex: 1.5, color: "#dc2626" }}>Rs {row.deductions.toLocaleString()}</Text>
          <Text style={{ flex: 1.5, color: "#16a34a" }}>Rs {row.disbursed.toLocaleString()}</Text>
          <Text style={{ flex: 1.5, textAlign: "right", fontFamily: "Helvetica-Bold" }}>
            Rs {row.net.toLocaleString()}
          </Text>
        </View>
      ))}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginTop: 10,
          paddingTop: 8,
          borderTopWidth: 2,
          borderTopColor: "#334155",
        }}
      >
        <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 11, color: "#16a34a" }}>
          Disbursed: Rs {totalDisbursed.toLocaleString()}
        </Text>
        <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 13, color: "#1e293b" }}>
          Net Payroll: Rs {totalNet.toLocaleString()}
        </Text>
      </View>
    </View>
  );
}

// ─── Main Export Component ─────────────────────────────────────────────────────
export function FinanceReportPDF({
  type,
  reportData,
  month,
  year,
  settings,
}: {
  type: "collection" | "outstanding" | "payroll";
  reportData: any[];
  month?: number;
  year?: number;
  settings: any;
}) {
  const titleMap = {
    collection: "Fee Collection Report",
    outstanding: "Outstanding Balances Report",
    payroll: "Payroll Summary",
  };

  const periodLabel =
    month && year
      ? format(new Date(year, month - 1), "MMMM yyyy")
      : "All Time";

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
            <Text style={styles.reportTitle}>{titleMap[type]}</Text>
            <Text style={styles.reportMeta}>Period: {periodLabel}</Text>
            <Text style={styles.reportMeta}>Records: {reportData.length}</Text>
          </View>
        </View>

        {/* Table */}
        {type === "collection" && <CollectionTable data={reportData} />}
        {type === "outstanding" && <OutstandingTable data={reportData} />}
        {type === "payroll" && <PayrollTable data={reportData} />}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text>Generated on {format(new Date(), "PPp")}</Text>
          <Text
            render={({ pageNumber, totalPages }) =>
              `Page ${pageNumber} of ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
}
