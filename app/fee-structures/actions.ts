"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function createFeeStructure(formData: FormData) {
  const classId = String(formData.get("classId") ?? "").trim();
  const term = String(formData.get("term") ?? "").trim();
  const dueDateRaw = String(formData.get("dueDate") ?? "").trim();
  const names = formData.getAll("headName").map((v) => String(v).trim());
  const amounts = formData.getAll("headAmount").map((v) => Number(v));

  const feeHeads = names
    .map((name, i) => ({ name, amount: amounts[i] }))
    .filter((head) => head.name && Number.isFinite(head.amount));

  if (!classId || !term || !dueDateRaw || feeHeads.length === 0) return;

  await prisma.feeStructure.create({
    data: {
      classId,
      term,
      dueDate: new Date(dueDateRaw),
      feeHeads: { create: feeHeads },
    },
  });

  revalidatePath("/fee-structures");
}
