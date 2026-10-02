import { editableField } from "@simmalugnt-se/payload-visual-editing/frontend";
import { Link } from "@/i18n/navigation";
import { resolveLinkField } from "@/payload/utilities/link-field";
import type { CallToActionBlock, LayoutBlockComponentProps } from "../types";

export function CallToActionBlockComponent({
  block,
}: LayoutBlockComponentProps<CallToActionBlock>) {
  const resolvedLink = resolveLinkField(block.button?.link);

  return (
    <section className="surface space-y-4 p-6 lg:p-8">
      <h2 {...editableField("title")} className="text-2xl font-semibold text-neutral-950">
        {block.title}
      </h2>
      {block.text ? (
        <p
          {...editableField("text")}
          className="max-w-2xl whitespace-pre-line leading-7 text-neutral-600"
        >
          {block.text}
        </p>
      ) : null}
      {resolvedLink ? (
        <Link
          {...editableField("button.link.label")}
          href={resolvedLink.href}
          rel={resolvedLink.rel}
          target={resolvedLink.target}
          className="inline-flex h-10 items-center bg-neutral-950 px-4 text-sm font-semibold text-white hover:bg-neutral-700"
        >
          {block.button.link.label}
        </Link>
      ) : null}
    </section>
  );
}
