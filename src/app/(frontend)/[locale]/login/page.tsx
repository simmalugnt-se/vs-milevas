import type { Metadata } from "next";
import Image from "next/image";
import { Login } from "@/components/blocks/login";
import { LoginForm } from "@/features/login/LoginForm";
import loginForklift from "./login-forklift.jpg";

export const metadata: Metadata = { title: "Logga in", robots: { index: false, follow: false } };

/**
 * Login as in Figma, with Figma's photo: dealers sign in, apply for an account and reset their
 * password here (`LoginForm`); the emailed reset link comes back with `?reset=`.
 */
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ reset?: string | string[] }>;
}) {
  const { reset } = await searchParams;
  return (
    <Login
      data-page-background="dark"
      image={
        <Image
          src={loginForklift}
          alt=""
          fill
          priority
          sizes="50vw"
          className="object-cover"
          placeholder="blur"
        />
      }
    >
      <LoginForm resetToken={typeof reset === "string" ? reset : undefined} />
    </Login>
  );
}
