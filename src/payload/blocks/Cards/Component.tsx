import { editableBlock, editableField } from "@simmalugnt-se/payload-visual-editing/frontend";
import { Link } from "@/i18n/navigation";
import { resolveLinkField } from "@/payload/utilities/link-field";
import type { CardsBlock, LayoutBlockComponentProps } from "../types";

export function CardsBlockComponent({ block }: LayoutBlockComponentProps<CardsBlock>) {
  return (
    <section className="space-y-6">
      {block.heading ? (
        <h2 {...editableField("heading")} className="text-2xl font-semibold text-neutral-950">
          {block.heading}
        </h2>
      ) : null}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {block.items?.map((item, index) => {
          const resolvedLink = resolveLinkField(item.link);

          return (
            <article
              key={item.id ?? index}
              {...editableBlock(item)}
              className="surface space-y-4 p-6"
            >
              <h3 {...editableField("title")} className="text-lg font-semibold text-neutral-950">
                {item.title}
              </h3>
              {item.text ? (
                <p
                  {...editableField("text")}
                  className="whitespace-pre-line leading-7 text-neutral-600"
                >
                  {item.text}
                </p>
              ) : null}
              {resolvedLink ? (
                <Link
                  {...editableField("link.label")}
                  href={resolvedLink.href}
                  rel={resolvedLink.rel}
                  target={resolvedLink.target}
                  className="inline-block font-semibold text-neutral-950 underline underline-offset-4"
                >
                  {item.link.label}
                </Link>
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}
