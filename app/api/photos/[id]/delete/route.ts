import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import cloudinary from "@/lib/cloudinary";

export async function DELETE(
  req: Request,
  // 1. UPDATE TYPE: params is now a Promise
  { params }: { params: Promise<{ id: string }> }
) {
  // 2. AWAIT PARAMS: You must await the promise before accessing .id
  const { id } = await params;

  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 3. USE 'id' (not params.id)
  const photo = await prisma.photo.findUnique({
    where: { id },
  });

  if (!photo || photo.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // delete from cloudinary
  if (photo.publicId) {
    await cloudinary.uploader.destroy(photo.publicId);
  }

  // delete from database
  await prisma.photo.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}