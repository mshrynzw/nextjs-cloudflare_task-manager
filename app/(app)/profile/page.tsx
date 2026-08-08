import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function ProfileIndexPage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    redirect("/login");
  }
  redirect(`/profile/${userId}`);
}
