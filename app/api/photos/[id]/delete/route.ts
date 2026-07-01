import { prisma } from "@/lib/prisma";
import cloudinary from "@/lib/cloudinary";
import { apiSuccess, handleRoute, HttpError, requireUser } from "@/lib/api";

export const DELETE = handleRoute(
  async (_req: Request, { params }: { params: Promise<{ id: string }> }) => {
    const user = await requireUser();
    const { id } = await params;

    const photo = await prisma.photo.findUnique({
      where: { id },
      select: { id: true, userId: true, publicId: true },
    });

    // Same response whether the photo is missing or owned by someone else, so
    // the endpoint can't be used to probe which photo ids exist.
    if (!photo || photo.userId !== user.id) {
      throw new HttpError(404, "Photo not found.");
    }

    // Remove the DB row first (source of truth); the Cloudinary asset is
    // best-effort — a failure there only leaves an orphaned file, not a
    // dangling record.
    await prisma.photo.delete({ where: { id } });

    if (photo.publicId) {
      try {
        await cloudinary.uploader.destroy(photo.publicId);
      } catch (err) {
        console.error("Cloudinary destroy failed for", photo.publicId, err);
      }
    }

    return apiSuccess({ success: true });
  }
);
