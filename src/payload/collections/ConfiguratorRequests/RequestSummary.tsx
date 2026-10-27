"use client";

import { useConfig, useDocumentInfo } from "@payloadcms/ui";
import { type CSSProperties, type ReactNode, useEffect, useState } from "react";
import type { ConfiguratorRequest, Dealer } from "@/payload-types";

/**
 * A request as sales reads it, at the top of the request: who sent it and how to reach them, then
 * the configuration as the quote showed it, with prices (and dealer prices), financing, delivery
 * and specifications. Read from the saved request; the fields behind it are hidden in the form.
 */

const kr = (value: number | null | undefined) =>
  typeof value === "number"
    ? new Intl.NumberFormat("sv-SE", {
        style: "currency",
        currency: "SEK",
        maximumFractionDigits: 0,
      }).format(value)
    : "–";

const section: CSSProperties = { marginBottom: "calc(var(--base) * 1.5)" };
const heading: CSSProperties = { margin: "0 0 calc(var(--base) * 0.5)" };
const muted: CSSProperties = { color: "var(--theme-elevation-500)" };
const table: CSSProperties = { borderCollapse: "collapse", width: "100%", maxWidth: "48rem" };
const cell: CSSProperties = {
  borderTop: "1px solid var(--theme-elevation-150)",
  padding: "calc(var(--base) * 0.4) calc(var(--base) * 0.6) calc(var(--base) * 0.4) 0",
  textAlign: "left",
  verticalAlign: "top",
};
const number: CSSProperties = { ...cell, textAlign: "right", whiteSpace: "nowrap" };

type Fact = { label: string; value: ReactNode };

function Facts({ rows }: { rows: Fact[] }) {
  const shown = rows.filter(({ value }) => value !== undefined && value !== null && value !== "");
  if (shown.length === 0) return null;
  return (
    <dl
      style={{
        display: "grid",
        gridTemplateColumns: "max-content 1fr",
        gap: "calc(var(--base) * 0.3) var(--base)",
        margin: 0,
      }}
    >
      {shown.map(({ label, value }) => (
        <div key={label} style={{ display: "contents" }}>
          <dt style={muted}>{label}</dt>
          <dd style={{ margin: 0 }}>{value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Whether sales and the customer got their emails, in a line. */
function emailStatus(request: ConfiguratorRequest): ReactNode {
  switch (request.emailStatus) {
    case "sent":
      return request.customerEmailId ? "Skickat till säljaren och kunden" : "Skickat till säljaren";
    case "failed":
      return (
        <span style={{ color: "var(--theme-error-500)" }}>
          Kunde inte skickas{request.emailError ? `: ${request.emailError}` : ""}
        </span>
      );
    case "notConfigured":
      return "Skickades inte: e-post är inte inställd på den här miljön";
    default:
      return "Skickas…";
  }
}

export function RequestSummary() {
  const { id } = useDocumentInfo();
  const {
    config: {
      routes: { admin, api },
      serverURL,
    },
  } = useConfig();
  const [request, setRequest] = useState<ConfiguratorRequest | null>(null);

  useEffect(() => {
    if (!id) return;
    const controller = new AbortController();
    fetch(`${serverURL}${api}/configurator-requests/${id}?depth=1`, {
      credentials: "include",
      signal: controller.signal,
    })
      .then((response) => (response.ok ? response.json() : null))
      .then(setRequest)
      .catch(() => {});
    return () => controller.abort();
  }, [api, id, serverURL]);

  if (!request) return <p style={muted}>Läser in beställningen…</p>;

  const contact = request.contact ?? {};
  const dealer =
    request.dealer && typeof request.dealer === "object" ? (request.dealer as Dealer) : null;
  const lines = request.lines ?? [];
  const showDealerPrices = lines.some((line) => typeof line.dealerPrice === "number");
  const truck = [request.familyName, request.model].filter(Boolean).join(", ");
  const financing = request.financing;

  return (
    <div style={{ marginBottom: "var(--base)" }}>
      <div style={section}>
        <h3 style={heading}>
          {request.requestType === "call" ? "Vill bli uppringd" : "Beställning"}
        </h3>
        <Facts
          rows={[
            { label: "Företag", value: contact.company },
            { label: "Organisationsnummer", value: contact.organizationNumber },
            { label: "Namn", value: contact.name },
            {
              label: "E-post",
              value: contact.email ? (
                <a href={`mailto:${contact.email}`}>{contact.email}</a>
              ) : undefined,
            },
            {
              label: "Telefon",
              value: contact.phone ? (
                <a href={`tel:${contact.phone}`}>{contact.phone}</a>
              ) : undefined,
            },
            {
              label: "Återförsäljare",
              value: dealer ? (
                <a href={`${admin}/collections/dealers/${dealer.id}`}>
                  {dealer.company} ({dealer.email})
                </a>
              ) : undefined,
            },
            {
              label: "Ring",
              value:
                request.requestType === "call"
                  ? request.callPreference === "specific" && request.preferredTime
                    ? request.preferredTime
                    : "Så snart som möjligt"
                  : undefined,
            },
            {
              label: "Meddelande",
              value: request.message ? (
                <span style={{ whiteSpace: "pre-line" }}>{request.message}</span>
              ) : undefined,
            },
          ]}
        />
      </div>

      <div style={section}>
        <h3 style={heading}>
          {truck || "Konfiguration"}
          {request.sku ? (
            <span style={{ ...muted, fontWeight: "normal" }}> · {request.sku}</span>
          ) : null}
        </h3>
        {request.complete === false ? (
          <p style={{ ...muted, marginTop: 0 }}>
            Samtalet bokades innan alla steg var valda: här är valen hittills.
          </p>
        ) : null}
        {lines.length > 0 ? (
          <table style={table}>
            <thead>
              <tr>
                <th style={{ ...cell, ...muted, borderTop: 0 }}>Konfiguration</th>
                <th style={{ ...number, ...muted, borderTop: 0 }}>Pris</th>
                {showDealerPrices ? (
                  <th style={{ ...number, ...muted, borderTop: 0 }}>ÅF-pris</th>
                ) : null}
              </tr>
            </thead>
            <tbody>
              {lines.map((line, index) => {
                const yearly = line.kind === "service" ? "/år" : "";
                return (
                  <tr key={line.id ?? index}>
                    <td style={cell}>{line.label}</td>
                    <td style={number}>
                      {kr(line.price)}
                      {yearly}
                    </td>
                    {showDealerPrices ? (
                      <td style={number}>
                        {typeof line.dealerPrice === "number" ? kr(line.dealerPrice) : ""}
                      </td>
                    ) : null}
                  </tr>
                );
              })}
              <tr>
                <th style={{ ...cell, borderTopWidth: 2 }}>Totalpris exkl. moms</th>
                <th style={{ ...number, borderTopWidth: 2 }}>{kr(request.totalPrice)}</th>
                {showDealerPrices ? (
                  <th style={{ ...number, borderTopWidth: 2 }}>{kr(request.dealerTotalPrice)}</th>
                ) : null}
              </tr>
            </tbody>
          </table>
        ) : (
          <p style={muted}>Inga val sparades med förfrågan.</p>
        )}
      </div>

      <div style={section}>
        <Facts
          rows={[
            {
              label: "Finansiering",
              value: financing?.label
                ? `${financing.label}: ${kr(financing.price)}${financing.monthly ? "/mån" : ""}`
                : undefined,
            },
            {
              label: "Serviceavtal",
              value: request.serviceAgreement?.selected
                ? `Ja, ${kr(request.serviceAgreement.annualPrice)}/år`
                : "Nej",
            },
            { label: "Uppskattad leverans", value: request.deliveryTime },
            { label: "Garanti", value: request.warranty },
            {
              label: "Offerten",
              value: request.sourceUrl ? (
                <a href={request.sourceUrl} target="_blank" rel="noreferrer">
                  Öppna som kunden såg den
                </a>
              ) : undefined,
            },
            { label: "Mejl", value: emailStatus(request) },
          ]}
        />
      </div>

      {request.specifications?.length ? (
        <div style={section}>
          <h3 style={heading}>Tekniska specifikationer</h3>
          <table style={table}>
            <tbody>
              {request.specifications.map((spec, index) => (
                <tr key={spec.id ?? index}>
                  <td style={cell}>{spec.label}</td>
                  <td style={number}>{spec.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
