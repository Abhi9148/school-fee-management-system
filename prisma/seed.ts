// prisma/seed.ts
// Run: npx tsx prisma/seed.ts
// Creates realistic demo data: classes, students, fee structures, and a
// mix of paid / partial / unpaid invoices so the demo doesn't look empty.

import { PrismaClient } from "@prisma/client";
import { generateInvoicesForClass } from "../lib/generateInvoices";
import { recordPayment } from "../lib/recordPayment";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding...");

  const classNames = ["Grade 5 - A", "Grade 6 - B", "Grade 7 - A", "Grade 8 - C"];
  const classes = [];
  for (const name of classNames) {
    classes.push(await prisma.class.create({ data: { name } }));
  }

  let admissionCounter = 1000;
  for (const cls of classes) {
    for (let i = 1; i <= 5; i++) {
      await prisma.student.create({
        data: {
          name: `Student ${cls.name.split(" ")[1]}-${i}`,
          admissionNo: `ADM${admissionCounter++}`,
          classId: cls.id,
          parentName: `Parent of Student ${i}`,
          parentContact: `98765${String(10000 + admissionCounter).slice(-5)}`,
          status: "ACTIVE",
        },
      });
    }
  }

  // Fee structure per class, Term 1, due 10 days ago (so some invoices land as overdue)
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() - 10);

  const feeStructureIds: string[] = [];
  for (const cls of classes) {
    const fs = await prisma.feeStructure.create({
      data: {
        classId: cls.id,
        term: "Term 1",
        dueDate,
        feeHeads: {
          create: [
            { name: "Tuition Fee", amount: 15000 },
            { name: "Transport Fee", amount: 3000 },
            { name: "Lab Fee", amount: 1500 },
          ],
        },
      },
    });
    feeStructureIds.push(fs.id);
  }

  // Generate invoices for every class
  for (const fsId of feeStructureIds) {
    await generateInvoicesForClass(fsId);
  }

  // Now simulate a realistic mix of payment states
  const allInvoices = await prisma.invoice.findMany();

  for (let i = 0; i < allInvoices.length; i++) {
    const inv = allInvoices[i];
    const mod = i % 4;

    if (mod === 0) {
      // Fully paid, on time
      await recordPayment(inv.id, inv.totalAmount, "UPI", new Date(Date.now() - 15 * 86400000));
    } else if (mod === 1) {
      // Partially paid
      await recordPayment(inv.id, inv.totalAmount / 2, "CASH", new Date());
    } else if (mod === 2) {
      // Unpaid, past due date -> will show as overdue once a payment attempt or report runs
      // leave as is (status stays UNPAID until a payment or a status-refresh job touches it)
    } else {
      // Paid late (after due date) -> triggers late fee logic
      await recordPayment(inv.id, inv.totalAmount, "CARD", new Date());
    }
  }

  console.log("Seeding complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
