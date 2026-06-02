"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/account/login");
  }, [router]);

  return (
    <div className="luxury-container py-32 text-center text-sm text-muted">
      Redirecting to registration...
    </div>
  );
}
