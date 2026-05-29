import { auth } from "@/lib/auth";
import { getParentProfile } from "@/lib/parent/data";
import ProfileForm from "@/components/parent/ProfileForm";
import { redirect } from "next/navigation";

export default async function ParentProfilePage() {
  const session = await auth();
  const user = await getParentProfile(session!.user!.id);

  if (!user) {
    redirect("/login?callbackUrl=/parent/profile");
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="font-heading text-h1 font-bold text-blue-800">Your profile</h1>
        <p className="font-body text-body text-gray-500 mt-1">
          Update your contact details and profile photo.
        </p>
      </div>
      <ProfileForm user={user} />
    </main>
  );
}
