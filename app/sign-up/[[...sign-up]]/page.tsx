
import { SignUp } from "@clerk/nextjs";
import { Suspense } from "react";

export default function SignUpPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-[#F7F3EA]">
        <p className="text-sm text-[#183B30]">
          Loading sign up...
        </p>
      </div>
    }>
      <SignUp />
    </Suspense>
  );
}
