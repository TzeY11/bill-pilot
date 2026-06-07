import { Suspense } from "react";
import { AuthForm } from "@/components/AuthForm";
import { isRegistrationOpen } from "@/lib/server/auth";

export const dynamic = "force-dynamic";

export default function RegisterPage() {
  return (
    <Suspense>
      <AuthForm mode="register" canRegister={isRegistrationOpen()} />
    </Suspense>
  );
}
