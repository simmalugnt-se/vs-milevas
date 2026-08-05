import {
  type JSXConvertersFunction,
  LinkJSXConverter,
  RichText,
} from "@payloadcms/richtext-lexical/react";
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
};

export function PayloadRichText({ className, data }: PayloadRichTextProps) {
  return (
    <RichText className={className} converters={payloadRichTextConverters} data={data as never} />
  );
}
