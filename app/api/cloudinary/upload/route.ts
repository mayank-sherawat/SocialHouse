import cloudinary from "@/lib/cloudinary";
import { prisma } from "@/lib/prisma";
import { apiSuccess, handleRoute, requireUser } from "@/lib/api";
import { assertValidImage, fileToDataUri } from "@/lib/upload";
import { PHOTO, UPLOAD } from "@/lib/constants";

export const POST = handleRoute(async (req: Request) => {
  const user = await requireUser();

  const formData = await req.formData();
  const file = formData.get("file");
  const caption = ((formData.get("caption") as string) || "").trim();

  assertValidImage(file); // narrows `file` to a validated image File

  const uploadResult = await cloudinary.uploader.upload(await fileToDataUri(file), {
    folder: UPLOAD.FOLDERS.POSTS,
    resource_type: "image",
  });

  try {
    const photo = await prisma.photo.create({
      data: {
        imageUrl: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        caption: caption.slice(0, PHOTO.CAPTION_MAX_LENGTH) || null,
        userId: user.id,
      },
    });

    return apiSuccess(photo, 201);
  } catch (err) {
    // If database insertion fails, roll back Cloudinary asset to prevent orphaned storage
    if (uploadResult.public_id) {
      try {
        await cloudinary.uploader.destroy(uploadResult.public_id);
      } catch (destroyErr) {
        console.error("Failed to clean up Cloudinary upload on DB error:", destroyErr);
      }
    }
    throw err;
  }
});
