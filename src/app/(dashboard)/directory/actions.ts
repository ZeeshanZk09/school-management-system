"use server";

import Papa from "papaparse";
import { requirePermission } from "@/lib/auth/permissions";
import prisma from "@/lib/prisma";

export async function exportDirectoryCSV(type: "students" | "staff") {
  try {
    await requirePermission("directory.read");

    let data: any[] = [];

    if (type === "students") {
      const students = await prisma.student.findMany({
        where: { isDeleted: false },
        include: {
          enrollments: {
            where: { academicYear: { isActive: true } },
            include: { class: true, section: true },
          },
          guardians: { where: { isPrimary: true } },
        },
      });

      data = students.map((s) => ({
        "Full Name": s.fullName,
        "Admission #": s.admissionNumber,
        Class: s.enrollments[0]?.class.name || "N/A",
        Section: s.enrollments[0]?.section?.name || "N/A",
        "Roll #": s.enrollments[0]?.rollNumber || "N/A",
        Email: s.email || "N/A",
        Phone: s.phoneNumber || "N/A",
        "Primary Guardian": s.guardians[0]?.fullName || "N/A",
        "Guardian Relation": s.guardians[0]?.relationship || "N/A",
        "Guardian Contact": s.guardians[0]?.phoneNumber || "N/A",
      }));
    } else {
      const staff = await prisma.staff.findMany({
        where: { isDeleted: false },
      });

      data = staff.map((s) => ({
        "Full Name": s.fullName,
        "Staff #": s.staffNumber,
        Designation: s.designation,
        Department: s.department || "N/A",
        Email: s.email,
        Phone: s.phoneNumber || "N/A",
        "Joining Date": s.joiningDate
          ? s.joiningDate.toLocaleDateString()
          : "N/A",
        Type: s.employmentType,
      }));
    }

    const csv = Papa.unparse(data);
    return { success: true, csv };
  } catch (error: any) {
    console.error("Export error:", error);
    return { success: false, message: error.message };
  }
}
