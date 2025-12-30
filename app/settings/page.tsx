import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import SettingsForm from "@/components/SettingsForm";
import { Inter } from "next/font/google";

// Ensure consistent font usage
const inter = Inter({ subsets: ["latin"] });

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      username: true,
      email: true,
      bio: true,
    },
  });

  if (!user) redirect("/auth");

  return (
    <div className={`min-h-screen bg-zinc-50/50 pb-32 ${inter.className}`}>
      {/* Decorative Header Background */}
      <div className="h-48 bg-zinc-900 w-full relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#ffffff_1px,transparent_1px)] background-size:[16px_16px]"></div>
      </div>

      <div className="max-w-2xl mx-auto px-4 -mt-24 relative z-10">
        {/* Header Text */}
        <div className="mb-8 text-center sm:text-left">
          <h1 className="text-3xl font-extrabold text-white mb-2">Account Settings</h1>
          <p className="text-zinc-300 font-medium">Manage your profile details and security.</p>
        </div>

        {/* Form Container */}
        <SettingsForm user={user} />
      </div>
    </div>
  );
}