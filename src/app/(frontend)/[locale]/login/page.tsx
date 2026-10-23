import type { Metadata } from "next";
import Image from "next/image";
import { Login } from "@/components/blocks/login";
import { LoginForm } from "@/features/login/LoginForm";
import loginForklift from "./login-forklift.jpg";

export const metadata: Metadata = { title: "Logga in", robots: { index: false, follow: false } };

/** Login as in Figma, with Figma's photo. The form is not connected yet (`LoginForm`). */
export default function LoginPage() {
  return (
    <Login
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
      <LoginForm />
    </Login>
  );
}
