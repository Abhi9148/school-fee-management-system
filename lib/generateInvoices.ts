// lib/generateInvoices.ts
// Core business process: turn a Fee Structure into real Invoices
// for every active student in that class.

import { prisma } from "@/lib/prisma";

export async function generateInvoicesForClass(feeStructureId: string) {
  const feeStructure = await prisma.feeStructure.findUnique({
    where: { id: feeStructureId },
    include: { feeHeads: true, class: { include: { students: true } } },
  });

  if (!feeStructure) throw new Error("Fee structure not found");

  const totalAmount = feeStructure.feeHeads.reduce(
    (sum, head) => sum + head.amount,
    0
  );

  const activeStudents = feeStructure.class.students.filter(
    (s) => s.status === "ACTIVE"
  );

  const createdInvoices = [];

  for (const student of activeStudents) {
    // Avoid duplicate invoices if this was already run for this student+term
    const existing = await prisma.invoice.findFirst({
      where: { studentId: student.id, feeStructureId: feeStructure.id },
    });
    if (existing) continue;

    const invoice = await prisma.invoice.create({
      data: {
        studentId: student.id,
        feeStructureId: feeStructure.id,
        totalAmount,
        dueDate: feeStructure.dueDate,
        status: "UNPAID",
      },
    });

    createdInvoices.push(invoice);
  }

  return createdInvoices;
}
