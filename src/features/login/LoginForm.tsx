"use client";

import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";

export type LoginMode = "login" | "create";

type LoginErrors = { email?: string; password?: string };

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const linkClassName =
  "text-text-s text-ui-primary underline decoration-from-font [text-underline-position:from-font]";

function validate(mode: LoginMode, email: string, password: string): LoginErrors {
  const errors: LoginErrors = {};
  if (!email) errors.email = "Ange din e-post.";
  else if (!emailPattern.test(email)) errors.email = "Ange en giltig e-postadress.";
  if (!password) errors.password = "Ange ett lösenord.";
  else if (mode === "create" && password.length < 8) {
    errors.password = "Lösenordet behöver minst 8 tecken.";
  }
  return errors;
}

/**
 * Login's two states from Figma: Logga in (e-mail, password, "Jag har glömt mitt lösenord") and
 * Skapa konto (e-mail, password), with a link between them. Nothing is sent yet: the fields are
 * checked here, and a valid form says that login is not connected.
 * TODO(login): connect to real authentication.
 */
export function LoginForm({
  initialMode = "login",
  initialErrors = {},
  initialMessage,
}: {
  initialMode?: LoginMode;
  /** For the kitchensink: show the error states without submitting. */
  initialErrors?: LoginErrors;
  initialMessage?: string;
}) {
  const [mode, setMode] = useState(initialMode);
  const [errors, setErrors] = useState<LoginErrors>(initialErrors);
  const [message, setMessage] = useState(initialMessage);
  const [pending, setPending] = useState(false);
  const isLogin = mode === "login";

  const switchMode = () => {
    setMode(isLogin ? "create" : "login");
    setErrors({});
    setMessage(undefined);
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const next = validate(
      mode,
      String(data.get("email") ?? "").trim(),
      String(data.get("password") ?? ""),
    );
    setErrors(next);
    setMessage(undefined);
    if (Object.keys(next).length > 0) return;
    setPending(true);
    setTimeout(() => {
      setPending(false);
      setMessage(
        isLogin
          ? "Inloggningen är inte kopplad än."
          : "Konton kan inte skapas än; inloggningen är inte kopplad.",
      );
    }, 600);
  };

  return (
    <form noValidate onSubmit={onSubmit} className="flex flex-col gap-(--spacing-lg)">
      <div className="flex flex-col gap-(--spacing-2xs) text-ui-primary">
        <h1 className="text-text-xl text-pretty">{isLogin ? "Logga in" : "Skapa konto"}</h1>
        <p className="flex flex-wrap items-center gap-(--spacing-3xs) text-text-xs">
          {isLogin ? "Har du inget konto?" : "Har du redan ett konto?"}
          <button type="button" onClick={switchMode} className={linkClassName}>
            {isLogin ? "Skapa konto" : "Logga in"}
          </button>
        </p>
      </div>
      <div className="flex flex-col gap-(--spacing-sm)">
        <TextField
          key={`${mode}-email`}
          number="01"
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          error={errors.email}
        />
        <TextField
          key={`${mode}-password`}
          number="02"
          label="Lösenord"
          name="password"
          type="password"
          autoComplete={isLogin ? "current-password" : "new-password"}
          error={errors.password}
        />
      </div>
      <div className="flex flex-col gap-(--spacing-2xs)">
        {message ? (
          <p role="status" className="text-text-xs text-status-error">
            {message}
          </p>
        ) : null}
        <Button
          type="submit"
          mode="dark"
          size="m"
          iconRight="keyboard-arrow-right"
          disabled={pending}
        >
          {pending ? "Skickar…" : isLogin ? "Logga in" : "Skapa konto"}
        </Button>
        {isLogin ? (
          <button
            type="button"
            onClick={() => setMessage("Återställning av lösenord är inte kopplad än.")}
            className={`self-start ${linkClassName}`}
          >
            Jag har glömt mitt lösenord
          </button>
        ) : null}
      </div>
    </form>
  );
}
