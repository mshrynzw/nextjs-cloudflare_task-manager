"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { POST_LOGOUT_REDIRECT } from "@/features/auth/constants";

/**
 * Client-side sign-out — Auth.js Server Action `signOut` does not reliably
 * clear session cookies on Cloudflare Workers / OpenNext.
 */
export function SignOutButton() {
  const [pending, setPending] = useState(false);

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={pending}
      onClick={() => {
        setPending(true);
        void signOut({ callbackUrl: POST_LOGOUT_REDIRECT });
      }}
    >
      {pending ? "Please wait…" : "Sign out"}
    </Button>
  );
}
