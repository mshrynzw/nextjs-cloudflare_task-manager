"use client";

import { useState } from "react";
import { useI18n } from "@/components/providers/locale-provider";

interface PasswordFieldProps {
  id: string;
  autoComplete: "current-password" | "new-password";
  className: string;
}

export function PasswordField({
  id,
  autoComplete,
  className,
}: PasswordFieldProps) {
  const { t } = useI18n();
  const [isVisible, setIsVisible] = useState(false);
  const label = isVisible ? t.auth.hidePassword : t.auth.showPassword;

  return (
    <div className="relative">
      <input
        id={id}
        name="password"
        type={isVisible ? "text" : "password"}
        autoComplete={autoComplete}
        required
        minLength={8}
        maxLength={128}
        className={`${className} w-full pr-11`}
      />
      <button
        type="button"
        className="absolute inset-y-0 right-0 flex w-10 items-center justify-center rounded-r-lg text-zinc-400 hover:text-zinc-100 focus-visible:ring-2 focus-visible:ring-sky-500/40 focus-visible:outline-none"
        aria-label={label}
        aria-pressed={isVisible}
        onClick={() => setIsVisible((current) => !current)}
      >
        <img
          src={
            isVisible
              ? "/eye-slash-regular-full.svg"
              : "/eye-regular-full.svg"
          }
          alt=""
          className="size-4 invert opacity-80"
        />
      </button>
    </div>
  );
}
