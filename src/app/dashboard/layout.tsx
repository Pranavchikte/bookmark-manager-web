"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoggedIn } = useAuthStore();
  const router = useRouter();
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (hasMounted && !isLoggedIn) {
      router.push("/auth/signin");
    }
  }, [isLoggedIn, hasMounted, router]);

  if (!hasMounted || !isLoggedIn) {
    return <p className="p-4">Loading...</p>;
  }

  // If logged in, just render the children. No Toaster needed here.
  return <>{children}</>;
}