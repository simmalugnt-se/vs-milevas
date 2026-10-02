import { editableBlock } from "@simmalugnt-se/payload-visual-editing/frontend";
import { MediaBlockComponent } from "../Media/Component";
import { RichTextBlockComponent } from "../RichText/Component";
import type { ColumnsBlock, LayoutBlockComponentProps } from "../types";

const gridClasses: Record<number, string> = {
  2: "md:grid-cols-2",
  3: "md:grid-cols-3",
};

export function ColumnsBlockComponent({ block }: LayoutBlockComponentProps<ColumnsBlock>) {
  const columns = block.columns ?? [];

  return (
    <section className={`grid gap-8 ${gridClasses[columns.length] ?? ""}`}>
      {columns.map((column, index) => (
        <div key={column.id ?? index} {...editableBlock(column)} className="space-y-6">
          {column.content?.map((nested, nestedIndex) => (
            <div key={nested.id ?? nestedIndex} {...editableBlock(nested)}>
              {nested.blockType === "richText" ? (
                <RichTextBlockComponent block={nested} />
              ) : (
                <MediaBlockComponent block={nested} />
              )}
            </div>
          ))}
        </div>
      ))}
    </section>
  );
}
