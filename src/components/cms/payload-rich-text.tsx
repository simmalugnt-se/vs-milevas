import {
  type JSXConvertersFunction,
  LinkJSXConverter,
  RichText,
} from "@payloadcms/richtext-lexical/react";
import type { HTMLAttributes } from "react";
import { resolveLinkReferenceHref } from "@/payload/utilities/link-field";

const payloadRichTextConverters: JSXConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,
  ...LinkJSXConverter({
    internalDocToHref: ({ linkNode }) =>
      resolveLinkReferenceHref(linkNode.fields.doc) ?? linkNode.fields.url ?? "#",
  }),
});

type PayloadRichTextProps = {
  className?: string;
  data: Record<string, unknown>;
} & Omit<HTMLAttributes<HTMLDivElement>, "children" | "className">;

/** Renders the container itself so extra attributes (e.g. visual editing markers) land on it. */
export function PayloadRichText({ className, data, ...attributes }: PayloadRichTextProps) {
  return (
    <div className={className ?? "payload-richtext"} {...attributes}>
      <RichText converters={payloadRichTextConverters} data={data as never} disableContainer />
    </div>
  );
}
