import cloudinary from "@/lib/cloudinary";
import { prisma } from "@/lib/prisma";
import { apiSuccess, handleRoute, requireUser } from "@/lib/api";
import { assertValidImage, fileToDataUri } from "@/lib/upload";
import { UPLOAD } from "@/lib/constants";

export const POST = handleRoute(async (req: Request) => {
  const user = await requireUser();

  const form = await req.formData();
  const file = form.get("file");
  assertValidImage(file);

  const uploadRes = await cloudinary.uploader.upload(await fileToDataUri(file), {
    folder: UPLOAD.FOLDERS.AVATARS,
    resource_type: "image",
    transformation: [{ width: 400, height: 400, crop: "fill", gravity: "face" }],
  });

  await prisma.user.update({
    where: { id: user.id },
    data: { image: uploadRes.secure_url },
  });

  return apiSuccess({ success: true, url: uploadRes.secure_url });
});
