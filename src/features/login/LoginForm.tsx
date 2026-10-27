"use client";

import {
  type ReactNode,
  useActionState,
  useCallback,
  useEffect,
  useState,
  useTransition,
} from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";
import {
  applyForDealerAccount,
  type DealerFormState,
  loginDealer,
  logoutDealer,
  requestDealerPasswordReset,
  resetDealerPassword,
} from "@/features/dealers/actions";
import { useDealer } from "@/features/dealers/DealerProvider";
import { useRouter } from "@/i18n/navigation";

export type LoginMode = "login" | "apply" | "forgot" | "reset";

type LoginErrors = DealerFormState["fieldErrors"];

const linkClassName =
  "text-text-s text-ui-primary underline decoration-from-font [text-underline-position:from-font]";

const ACTIONS = {
  login: loginDealer,
  apply: applyForDealerAccount,
  forgot: requestDealerPasswordReset,
  reset: resetDealerPassword,
} satisfies Record<LoginMode, unknown>;

const SUBMIT: Record<LoginMode, string> = {
  login: "Logga in",
  apply: "Skicka ansökan",
  forgot: "Skicka länk",
  reset: "Spara lösenord",
};

function Heading({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="flex flex-col gap-(--spacing-2xs) text-ui-primary">
      <h1 className="text-text-xl text-pretty">{title}</h1>
      {children ? (
        <p className="flex flex-wrap items-center gap-(--spacing-3xs) text-text-xs">{children}</p>
      ) : null}
    </div>
  );
}

/**
 * A link between the forms. On its own line it stays at the left, as Figma's "Jag har glömt mitt
 * lösenord", instead of stretching across the column with its text centred.
 */
function SwitchLink({
  onClick,
  children,
  alone = false,
}: {
  onClick: () => void;
  children: ReactNode;
  alone?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${alone ? "self-start text-left" : ""} ${linkClassName}`}
    >
      {children}
    </button>
  );
}

/** A signed-in dealer: who, and signing out. */
function SignedIn({ company, onSignedOut }: { company: string; onSignedOut: () => void }) {
  const [pending, startTransition] = useTransition();
  return (
    <div className="flex flex-col gap-(--spacing-lg)">
      <Heading title="Du är inloggad">
        {company}. Dina ÅF-priser visas bredvid kundpriserna.
      </Heading>
      <div className="flex flex-col gap-(--spacing-2xs)">
        <ButtonLink href="/configurator" mode="dark" size="m" iconRight="keyboard-arrow-right">
          Bygg din truck
        </ButtonLink>
        <Button
          type="button"
          mode="light"
          size="m"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              await logoutDealer();
              onSignedOut();
            })
          }
        >
          Logga ut
        </Button>
      </div>
    </div>
  );
}

/** One of the forms; remounted per mode so each has its own action state. */
function ModeForm({
  mode,
  setMode,
  resetToken,
  initialErrors,
  onSignedIn,
}: {
  mode: LoginMode;
  setMode: (mode: LoginMode) => void;
  resetToken?: string;
  initialErrors?: LoginErrors;
  onSignedIn: () => void;
}) {
  const [state, formAction, pending] = useActionState<DealerFormState, FormData>(ACTIONS[mode], {
    ok: false,
    fieldErrors: initialErrors,
  });
  const errors = state.fieldErrors ?? {};
  const signedIn = state.ok && !state.message && (mode === "login" || mode === "reset");

  useEffect(() => {
    if (signedIn) onSignedIn();
  }, [signedIn, onSignedIn]);

  if (state.ok && mode === "apply") {
    return (
      <div className="flex flex-col gap-(--spacing-lg)">
        <Heading title="Tack för din ansökan">
          Vi går igenom den och mejlar dig när kontot är godkänt.
        </Heading>
        <SwitchLink alone onClick={() => setMode("login")}>
          Till inloggningen
        </SwitchLink>
      </div>
    );
  }
  if (state.ok && mode === "forgot") {
    return (
      <div className="flex flex-col gap-(--spacing-lg)">
        <Heading title="Kolla din e-post">
          Finns det ett konto med adressen har vi skickat en länk för att välja ett nytt lösenord.
          Länken gäller i en timme.
        </Heading>
        <SwitchLink alone onClick={() => setMode("login")}>
          Till inloggningen
        </SwitchLink>
      </div>
    );
  }

  let number = 0;
  const next = () => String(++number).padStart(2, "0");

  return (
    <form noValidate action={formAction} className="flex flex-col gap-(--spacing-lg)">
      {mode === "login" ? (
        <Heading title="Logga in">
          Har du inget konto?
          <SwitchLink onClick={() => setMode("apply")}>Ansök om konto</SwitchLink>
        </Heading>
      ) : mode === "apply" ? (
        <Heading title="Ansök om konto">
          För återförsäljare. Vi godkänner ansökan innan du kan logga in. Har du redan ett konto?
          <SwitchLink onClick={() => setMode("login")}>Logga in</SwitchLink>
        </Heading>
      ) : mode === "forgot" ? (
        <Heading title="Glömt lösenord">
          Ange din e-post så skickar vi en länk för att välja ett nytt lösenord.
        </Heading>
      ) : (
        <Heading title="Välj nytt lösenord">Minst 8 tecken.</Heading>
      )}
      <div className="flex flex-col gap-(--spacing-sm)">
        {mode === "apply" ? (
          <>
            {/* A field people never see; a bot fills it. */}
            <input className="hidden" tabIndex={-1} autoComplete="off" name="website" aria-hidden />
            <TextField
              number={next()}
              label="Företag"
              name="company"
              autoComplete="organization"
              error={errors.company}
            />
            <TextField
              number={next()}
              label="Namn"
              name="name"
              autoComplete="name"
              error={errors.name}
            />
          </>
        ) : null}
        {mode === "reset" ? (
          <input type="hidden" name="token" value={resetToken ?? ""} />
        ) : (
          <TextField
            number={next()}
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            error={errors.email}
          />
        )}
        {mode === "forgot" ? null : (
          <TextField
            number={next()}
            label={mode === "reset" ? "Nytt lösenord" : "Lösenord"}
            name="password"
            type="password"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            error={errors.password}
          />
        )}
      </div>
      <div className="flex flex-col gap-(--spacing-2xs)">
        {state.message ? (
          <p role="status" className="text-text-xs text-status-error">
            {state.message}
          </p>
        ) : null}
        <Button
          type="submit"
          mode="dark"
          size="m"
          iconRight="keyboard-arrow-right"
          disabled={pending}
        >
          {pending ? "Skickar…" : SUBMIT[mode]}
        </Button>
        {mode === "login" ? (
          <SwitchLink alone onClick={() => setMode("forgot")}>
            Jag har glömt mitt lösenord
          </SwitchLink>
        ) : mode === "forgot" || mode === "reset" ? (
          <SwitchLink alone onClick={() => setMode("login")}>
            Tillbaka till inloggningen
          </SwitchLink>
        ) : null}
      </div>
    </form>
  );
}

/**
 * Dealer login on Figma's Login (9170:26321): Logga in, and in place of Figma's Skapa konto an
 * application ("Ansök om konto") that an editor accepts in Admin. Also the forgotten password, the
 * new password from the emailed link (`resetToken`, from `?reset=`), and the signed-in dealer.
 */
export function LoginForm({
  initialMode = "login",
  initialErrors,
  resetToken,
}: {
  initialMode?: LoginMode;
  /** For the kitchensink: show the error states without submitting. */
  initialErrors?: LoginErrors;
  resetToken?: string;
}) {
  const router = useRouter();
  const { dealer, refresh } = useDealer();
  const [mode, setMode] = useState<LoginMode>(resetToken ? "reset" : initialMode);

  const onSignedIn = useCallback(() => {
    void refresh();
    // The reset link's token is spent; keep it out of the address.
    if (resetToken) router.replace("/login");
    setMode("login");
  }, [refresh, resetToken, router]);

  if (dealer && mode === "login") {
    return <SignedIn company={dealer.company} onSignedOut={() => void refresh()} />;
  }
  return (
    <ModeForm
      key={mode}
      mode={mode}
      setMode={setMode}
      resetToken={resetToken}
      initialErrors={initialErrors}
      onSignedIn={onSignedIn}
    />
  );
}
