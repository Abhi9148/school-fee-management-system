import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const store = await cookies();
  store.delete("admin_auth");
  return NextResponse.redirect(new URL("/", request.url));
}