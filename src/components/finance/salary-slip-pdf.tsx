'use client';

import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import { format } from 'date-fns';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: '#334155',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 2,
    borderBottomColor: '#6366f1',
    paddingBottom: 20,
    marginBottom: 20,
  },
  schoolInfo: {
    flex: 1,
  },
  schoolName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  address: {
    fontSize: 9,
    color: '#64748b',
    lineHeight: 1.4,
  },
  titleContainer: {
    textAlign: 'right',
  },
  title: {
    fontSize: 24,
    fontWeight: 'black',
    color: '#6366f1',
  },
  period: {
    fontSize: 10,
    marginTop: 4,
    color: '#64748b',
    fontWeight: 'bold',
  },
  infoSection: {
    flexDirection: 'row',
    marginBottom: 30,
    gap: 20,
  },
  infoBox: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 8,
  },
  label: {
    fontSize: 8,
    color: '#94a3b8',
    textTransform: 'uppercase',
    marginBottom: 4,
    fontWeight: 'bold',
  },
  value: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  table: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#334155',
    color: 'white',
    padding: 8,
    borderRadius: 4,
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    padding: 8,
  },
  col1: { flex: 3 },
  col2: { flex: 1, textAlign: 'right' },
  summarySection: {
    marginTop: 30,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  summaryBox: {
    width: 250,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  netPayBox: {
    marginTop: 10,
    backgroundColor: '#6366f1',
    color: 'white',
    padding: 15,
    borderRadius: 12,
  },
  netPayLabel: {
    fontSize: 10,
    opacity: 0.8,
  },
  netPayAmount: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 10,
    textAlign: 'center',
    fontSize: 8,
    color: '#94a3b8',
  },
  signatureSection: {
    marginTop: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  signatureBox: {
    width: 150,
    borderTopWidth: 1,
    borderTopColor: '#334155',
    paddingTop: 5,
    textAlign: 'center',
  },
});

const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export function SalarySlipPDF({ slip, staff, settings }: any) {
  const structure = staff.salaryStructures[0];
  const allowances = structure?.components.filter((c: any) => c.type === 'ALLOWANCE') || [];
  const deductions = structure?.components.filter((c: any) => c.type === 'DEDUCTION') || [];

  return (
    <Document>
      <Page size='A4' style={styles.page}>
        <View style={styles.header}>
          <View style={styles.schoolInfo}>
            <Text style={styles.schoolName}>{settings.schoolName}</Text>
            <Text style={styles.address}>{settings.addressLine1}</Text>
            {settings.addressLine2 && <Text style={styles.address}>{settings.addressLine2}</Text>}
            <Text style={styles.address}>
              {settings.city}, {settings.state} {settings.postalCode}
            </Text>
          </View>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>SALARY SLIP</Text>
            <Text style={styles.period}>
              {months[slip.periodMonth - 1]} {slip.periodYear}
            </Text>
          </View>
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoBox}>
            <Text style={styles.label}>Employee Details</Text>
            <Text style={styles.value}>{staff.fullName}</Text>
            <Text style={{ fontSize: 9, marginTop: 2 }}>ID: {staff.id.substring(0, 8)}</Text>
            <Text style={{ fontSize: 9 }}>Designation: {staff.designation}</Text>
            <Text style={{ fontSize: 9 }}>Department: {staff.department || 'N/A'}</Text>
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.label}>Slip Details</Text>
            <Text style={styles.value}>#SLIP-{slip.id.substring(0, 6).toUpperCase()}</Text>
            <Text style={{ fontSize: 9, marginTop: 2 }}>
              Generated: {format(new Date(slip.createdAt), 'PP')}
            </Text>
            <Text style={{ fontSize: 9 }}>
              Status: {slip.disbursements.length > 0 ? 'PAID' : 'GENERATED'}
            </Text>
          </View>
        </View>

        <Text style={[styles.label, { marginBottom: 8 }]}>Earnings & Allowances</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.col1}>Description</Text>
            <Text style={styles.col2}>Amount</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.col1}>Base Salary</Text>
            <Text style={styles.col2}>Rs {Number(structure?.basePay || 0).toLocaleString()}</Text>
          </View>
          {allowances.map((c: any, i: number) => (
            <View key={i} style={styles.tableRow}>
              <Text style={styles.col1}>{c.label}</Text>
              <Text style={styles.col2}>Rs {Number(c.amount).toLocaleString()}</Text>
            </View>
          ))}
        </View>

        {deductions.length > 0 && (
          <>
            <Text style={[styles.label, { marginTop: 20, marginBottom: 8 }]}>Deductions</Text>
            <View style={styles.table}>
              <View style={[styles.tableHeader, { backgroundColor: '#e2e8f0', color: '#1e293b' }]}>
                <Text style={styles.col1}>Description</Text>
                <Text style={styles.col2}>Amount</Text>
              </View>
              {deductions.map((c: any, i: number) => (
                <View key={i} style={styles.tableRow}>
                  <Text style={styles.col1}>{c.label}</Text>
                  <Text style={styles.col2}>Rs {Number(c.amount).toLocaleString()}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        <View style={styles.summarySection}>
          <View style={styles.summaryBox}>
            <View style={styles.summaryRow}>
              <Text style={{ color: '#64748b' }}>Gross Salary</Text>
              <Text style={{ fontWeight: 'bold' }}>
                Rs {Number(slip.grossPay).toLocaleString()}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={{ color: '#64748b' }}>Total Deductions</Text>
              <Text style={{ fontWeight: 'bold' }}>
                Rs {Number(slip.totalDeductions).toLocaleString()}
              </Text>
            </View>
            <View style={styles.netPayBox}>
              <Text style={styles.netPayLabel}>Net Payable</Text>
              <Text style={styles.netPayAmount}>Rs {Number(slip.netPay).toLocaleString()}</Text>
            </View>
          </View>
        </View>

        <View style={styles.signatureSection}>
          <View style={styles.signatureBox}>
            <Text style={{ fontSize: 9 }}>Employee Signature</Text>
          </View>
          <View style={styles.signatureBox}>
            <Text style={{ fontSize: 9 }}>Authorized Signatory</Text>
          </View>
        </View>

        <Text style={styles.footer}>
          This is a computer generated document and does not require a physical signature. Generated
          on {format(new Date(), 'PPpp')}
        </Text>
      </Page>
    </Document>
  );
}
