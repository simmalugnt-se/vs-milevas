import {
  editableBlock,
  editableField,
  editableGlobal,
} from "@simmalugnt-se/payload-visual-editing/frontend";
import type { TypedLocale } from "payload";
import { Footer, type FooterGroup, type FooterLink } from "@/components/blocks/footer";
import { getConfiguratorCatalog } from "@/features/configurator/data";
import { familyLink } from "@/payload/blocks/milevas-data";
import { getFooter, resolveNavItem } from "@/payload/data/globals";

type FooterComponentProps = {
  draft?: boolean;
  locale: TypedLocale;
};

/**
 * The site's footer: the Footer block (Figma 9264:22371) fed by the Footer global: its link columns
 * (`linkGroups`; one whose `source` is the truck families lists every published family), the
 * contact column (`contactHeading`, `email`, `phone`, `location`) and the copyright line. `navItems` stays in the global but is not shown: Figma's footer has columns.
 */
export async function FooterComponent({ draft = false, locale }: FooterComponentProps) {
  const footer = await getFooter(locale, draft);

  // Click-to-edit markers, only in Live Preview; they respond while the footer is edited.
  const mark = (attributes: ReturnType<typeof editableField>) => (draft ? attributes : {});

  const usesFamilies = (footer.linkGroups ?? []).some((group) => group.source === "truckFamilies");
  const catalog = usesFamilies ? await getConfiguratorCatalog(locale, draft) : undefined;
  const familyLinks = (catalog?.families ?? []).flatMap((family): FooterLink[] => {
    const link = familyLink(family);
    if (!link) return [];
    return [
      {
        label: family.name,
        href: link.href,
        rel: "rel" in link ? link.rel : undefined,
        target: "target" in link ? link.target : undefined,
      },
    ];
  });

  const groups = (footer.linkGroups ?? []).map(
    (group): FooterGroup => ({
      heading: <span {...mark(editableField("heading"))}>{group.heading}</span>,
      links:
        group.source === "truckFamilies"
          ? familyLinks
          : (group.links ?? []).flatMap((item): FooterLink[] => {
              const resolved = resolveNavItem(item);
              if (!resolved) return [];
              return [
                {
                  label: <span {...mark(editableField("link.label"))}>{item.link.label}</span>,
                  href: resolved.href,
                  rel: resolved.rel,
                  target: resolved.target,
                  attributes: mark(editableBlock(item)),
                },
              ];
            }),
      attributes: mark(editableBlock(group)),
    }),
  );

  const hasContact = footer.email || footer.phone || footer.location;

  return (
    <Footer
      groups={groups}
      contact={
        hasContact
          ? {
              heading: footer.contactHeading ?? "Kontakt",
              email: footer.email
                ? { address: footer.email, attributes: mark(editableField("email")) }
                : undefined,
              phone: footer.phone
                ? { number: footer.phone, attributes: mark(editableField("phone")) }
                : undefined,
              location: footer.location ?? undefined,
            }
          : undefined
      }
      copyright={footer.copyright ?? undefined}
      attributes={{
        id: "kontakt",
        "data-layout-block": "footer",
        ...mark(editableGlobal("footer")),
      }}
    />
  );
}
