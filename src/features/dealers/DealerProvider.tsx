"use client";

import { createContext, type ReactNode, useCallback, useContext, useEffect, useState } from "react";
import { getDealerSession } from "./actions";
import { type DealerSession, dealerPrice, discountFor } from "./pricing";
import { DEALER_HINT_COOKIE } from "./session-hint";

type DealerContextValue = {
  dealer: DealerSession | null;
  /** Read the session again, after signing in or out. */
  refresh: () => Promise<void>;
};

const DealerContext = createContext<DealerContextValue>({
  dealer: null,
  refresh: async () => {},
});

const signedInHint = () =>
  typeof document !== "undefined" &&
  document.cookie.split("; ").some((part) => part.startsWith(`${DEALER_HINT_COOKIE}=`));

/**
 * The signed-in dealer, read in the browser so pages stay cached for everyone: prices render as
 * customer prices, and dealer prices join them once the session is read. Visitors without the
 * hint cookie set at sign-in are not asked at all.
 */
export function DealerProvider({ children }: { children: ReactNode }) {
  const [dealer, setDealer] = useState<DealerSession | null>(null);
  const read = useCallback(
    () => (signedInHint() ? getDealerSession().catch(() => null) : Promise.resolve(null)),
    [],
  );
  const refresh = useCallback(async () => setDealer(await read()), [read]);
  useEffect(() => {
    let current = true;
    void read().then((session) => {
      if (current) setDealer(session);
    });
    return () => {
      current = false;
    };
  }, [read]);
  return <DealerContext.Provider value={{ dealer, refresh }}>{children}</DealerContext.Provider>;
}

export function useDealer() {
  return useContext(DealerContext);
}

/**
 * The dealer price of a customer price, with the discount of the model it is for (or of the chosen
 * model, for an option); null when no dealer is signed in or there is no discount: then nothing
 * beside the customer price is shown.
 */
export function useDealerPrice() {
  const { dealer } = useDealer();
  return useCallback(
    (price: number, model?: string): number | null => {
      if (!dealer) return null;
      const percent = discountFor(dealer, model);
      return percent > 0 ? dealerPrice(price, percent) : null;
    },
    [dealer],
  );
}
