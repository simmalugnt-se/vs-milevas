import { editableBlock, editableField } from "@simmalugnt-se/payload-visual-editing/frontend";
import type { FAQBlock, LayoutBlockComponentProps } from "../types";

export function FAQBlockComponent({ block }: LayoutBlockComponentProps<FAQBlock>) {
  return (
    <section className="max-w-3xl space-y-6">
      {block.heading ? (
        <h2 {...editableField("heading")} className="text-2xl font-semibold text-neutral-950">
          {block.heading}
        </h2>
      ) : null}
      <div className="divide-y divide-neutral-200 border-y border-neutral-200">
        {block.items?.map((item, index) => (
          <details key={item.id ?? index} {...editableBlock(item)} className="py-5">
            <summary
              {...editableField("question")}
              className="cursor-pointer font-semibold text-neutral-950"
            >
              {item.question}
            </summary>
            <p
              {...editableField("answer")}
              className="mt-4 whitespace-pre-line leading-7 text-neutral-600"
            >
              {item.answer}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
