import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import SettingsForm from "@/components/SettingsForm";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      username: true,
      email: true,
      bio: true,
    },
  });

  if (!user) redirect("/login");

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="border-b border-[#E2DFD7] pb-4 px-1">
        <h1 className="text-2xl font-bold tracking-tight text-[#181716]">
          Settings &amp; Security
        </h1>
        <p className="text-xs font-mono text-[#6C6860] mt-1">
          Manage your creator identity, bio, and password credentials.
        </p>
      </div>

      {/* Form Container */}
      <SettingsForm user={user} />
    </div>
  );
}