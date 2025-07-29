import Hero from "@/components/homepage/hero"
import CustomLayout from "@/components/layout/layout";
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export default async function Home() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (token) {
    redirect("/dashboard");
  }

  return (
    <CustomLayout>
    <Hero />
    </CustomLayout>
  );
}