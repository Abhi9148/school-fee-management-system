"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function createStudent(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const admissionNo = String(formData.get("admissionNo") ?? "").trim();
  const classId = String(formData.get("classId") ?? "").trim();
  const parentName = String(formData.get("parentName") ?? "").trim();
  const parentContact = String(formData.get("parentContact") ?? "").trim();

  if (!name || !admissionNo || !classId || !parentName || !parentContact) {
    return;
  }

  await prisma.student.create({
    data: { name, admissionNo, classId, parentName, parentContact },
  });

  revalidatePath("/students");
  revalidatePath("/classes");
  revalidatePath("/");
}
