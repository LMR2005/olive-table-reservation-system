
import { SignIn } from "@clerk/nextjs";
import { Suspense } from "react";

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-[#F7F3EA]">
        <p className="text-sm text-[#183B30]">
          Loading sign in...
        </p>
      </div>
    }>
      <SignIn />
    </Suspense>
  );
}
