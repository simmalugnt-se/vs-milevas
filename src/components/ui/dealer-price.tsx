import type { ReactNode } from "react";

/**
 * A customer price with the signed-in dealer's price under it ("ÅF 152 900 kr"), in the same text
 * style. Figma draws dealer prices only on the product card (`hover-INLOGGAD`); this is the code's
 * stand-in everywhere else until the design has one (see figma-notes). Without `dealer`, the price
 * alone.
 */
export function WithDealerPrice({ children, dealer }: { children: ReactNode; dealer?: ReactNode }) {
  if (dealer === undefined || dealer === null) return <>{children}</>;
  return (
    <span className="inline-flex flex-col items-end text-right">
      <span>{children}</span>
      <span>ÅF {dealer}</span>
    </span>
  );
}
