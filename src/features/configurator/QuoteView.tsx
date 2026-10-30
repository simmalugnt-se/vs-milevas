"use client";

import Image from "next/image";
import { useCallback, useState } from "react";
import { ConfiguratorQuote } from "@/components/blocks/configurator-quote";
import { ConfiguratorThanks } from "@/components/blocks/configurator-thanks";
import { Button, ButtonLink, TextLink } from "@/components/ui/button";
import { PriceBox } from "@/components/ui/price-box";
import { useDealerPrice } from "@/features/dealers/DealerProvider";
import { financingLabel } from "./engine";
import { CallRequestForm, OrderRequestForm, QuoteCopyForm, RequestDialog } from "./RequestForms";
import type { NextStep, ConfiguratorQuote as Quote } from "./types";

function formatPrice(value: number) {
  return new Intl.NumberFormat("sv-SE", {
    style: "currency",
    currency: "SEK",
    maximumFractionDigits: 0,
  }).format(value);
}

type QuoteViewProps = {
  quote: Quote;
  locale: string;
  /** Back to the configurator with this configuration. */
  configuratorHref: string;
  image?: { alt: string; url: string };
  warrantyNote?: string;
  nextSteps: NextStep[];
  /** The chosen model's brochure, or the truck type's; linked under the specifications. */
  brochure?: { title: string; url: string };
};

/**
 * The quote and what follows it (Figma `type=offert` and `type=TNX!`): the quote with its price
 * box, "Boka samtal" opening the call popup and "Fortsätt beställning" the order popup; once the
 * order is sent, the thank-you screen with the same price box. "Skicka kopia till mig" mails the
 * quote to the address given.
 */
export function QuoteView({
  quote,
  locale,
  configuratorHref,
  image,
  warrantyNote,
  nextSteps,
  brochure,
}: QuoteViewProps) {
  const [dialog, setDialog] = useState<"call" | "order" | null>(null);
  const dealerPrice = useDealerPrice();
  const dealerTotal = dealerPrice(quote.totalPrice, quote.modelKey);
  const [ordered, setOrdered] = useState(false);
  const close = useCallback(() => setDialog(null), []);
  const onSent = useCallback(() => {
    setDialog(null);
    setOrdered(true);
    window.scrollTo({ top: 0 });
  }, []);

  const configuration = {
    familyKey: quote.familyKey,
    financingKey: quote.financing.key,
    months: quote.financing.kind === "monthly" ? quote.financing.months : undefined,
    locale,
    selections: quote.selections,
    serviceAgreement: Boolean(quote.serviceAgreement),
  };

  const financing =
    quote.financing.kind === "monthly"
      ? {
          label: financingLabel(quote.financing),
          value: `${formatPrice(quote.financingPrice)}/mån`,
        }
      : undefined;
  const price = (
    <PriceBox
      variant="checkout"
      totalLabel="Totalpris"
      total={formatPrice(quote.totalPrice)}
      rows={[
        ...(dealerTotal === null
          ? []
          : [{ label: "Ditt ÅF-pris", value: formatPrice(dealerTotal) }]),
        ...(financing ? [financing] : []),
        ...(quote.serviceAgreement
          ? [
              {
                label: quote.serviceAgreement.label,
                value: `${formatPrice(quote.serviceAgreement.annualPrice)}/år`,
              },
            ]
          : []),
        ...(quote.deliveryTime
          ? [{ label: "Uppskattad leverans", value: quote.deliveryTime }]
          : []),
      ]}
      note={
        quote.warranty
          ? { label: "Garanti", value: quote.warranty, text: warrantyNote ?? "" }
          : undefined
      }
    />
  );
  const contact = (
    <Button
      mode="dark"
      size="s"
      iconRight="call"
      className="w-full"
      onClick={() => setDialog("call")}
    >
      Boka samtal
    </Button>
  );
  const truck = image ? (
    <Image
      src={image.url}
      alt={image.alt}
      fill
      sizes="(width >= 64rem) 60vw, 100vw"
      className="object-contain"
    />
  ) : undefined;

  return (
    <>
      {ordered ? (
        <ConfiguratorThanks
          heading="Tack för din beställning!"
          price={price}
          contact={contact}
          image={truck}
          stepsHeading="Vad händer nu?"
          steps={nextSteps}
        />
      ) : (
        <ConfiguratorQuote
          heading={quote.familySingularName ?? quote.familyName}
          back={
            <TextLink href={configuratorHref} iconLeft="arrow-left" icon={null}>
              Tillbaka till konfigurator
            </TextLink>
          }
          price={price}
          contact={contact}
          image={truck}
          tables={[
            {
              heading: "Konfiguration",
              action: (
                <TextLink href={configuratorHref} iconLeft="arrow-left" icon={null}>
                  Tillbaka till konfigurator
                </TextLink>
              ),
              rows: quote.lines
                .filter((line) => line.kind !== "service")
                .map((line) => ({ label: line.label, value: formatPrice(line.price) })),
            },
            ...(quote.specifications.length > 0 || brochure
              ? [
                  {
                    heading: "Tekniska specifikationer",
                    rows: quote.specifications.map((spec) => ({
                      label: spec.label,
                      value: spec.value,
                    })),
                    // Not in Figma: the brochure under the specifications (see figma-notes).
                    footer: brochure ? (
                      <ButtonLink
                        href={brochure.url}
                        target="_blank"
                        rel="noopener"
                        title={brochure.title}
                        variant="secondary"
                        border
                        iconRight="open-in-new"
                        className="w-full"
                      >
                        Produktbroschyr
                      </ButtonLink>
                    ) : undefined,
                  },
                ]
              : []),
          ]}
          copy={<QuoteCopyForm {...configuration} />}
          order={
            <Button
              mode="tejp"
              size="m"
              iconRight="shopping-cart"
              className="w-full max-desktop-s:gap-(--spacing-xs) max-desktop-s:p-(--spacing-xs)"
              onClick={() => setDialog("order")}
            >
              Fortsätt beställning
            </Button>
          }
        />
      )}
      <RequestDialog open={dialog === "call"} onClose={close} labelledBy="quote-call-heading">
        <CallRequestForm headingId="quote-call-heading" onClose={close} {...configuration} />
      </RequestDialog>
      <RequestDialog
        open={dialog === "order"}
        onClose={close}
        labelledBy="quote-order-heading"
        wide={nextSteps.length > 0}
      >
        <OrderRequestForm
          headingId="quote-order-heading"
          onClose={close}
          onSent={onSent}
          nextSteps={nextSteps}
          {...configuration}
        />
      </RequestDialog>
    </>
  );
}
