"use client";

import Image from "next/image";
import { useState } from "react";
import { Choice } from "@/components/ui/choice";
import { FinancingChoice } from "@/components/ui/financing-choice";
import truckPallet from "./assets/truck-pallet.png";

const options = [
  { id: "li", title: "Litium", price: "+12 000 kr", text: "Snabbladdning, inget underhåll" },
  { id: "pb", title: "Bly", price: "Ingår", text: "Beprövad och billigare" },
];

/** Clickable Choice pair, to try the selected state with a pointer and keyboard. */
export function ChoiceDemo() {
  const [selected, setSelected] = useState("li");
  return (
    <div className="grid tablet:grid-cols-2">
      {options.map((option) => (
        <Choice
          key={option.id}
          title={option.title}
          price={option.price}
          text={option.text}
          selected={selected === option.id}
          onClick={() => setSelected(option.id)}
          image={<Image src={truckPallet} alt="" fill sizes="16rem" className="object-contain" />}
        />
      ))}
    </div>
  );
}

const financing = [
  {
    id: "leasing",
    title: "Leasing",
    price: "3 561 kr/mån",
    text: "Finansbolaget äger trucken och du betalar en fast, förutsägbar månadskostnad.",
    term: true,
  },
  {
    id: "hyra",
    title: "Långtidshyra",
    price: "3 250 kr/mån",
    text: "All service ingår, från första dagen till sista.",
    term: true,
  },
  { id: "kop", title: "Köp", price: "169 900 kr", term: false },
];

/** Clickable FinancingChoice stack, to try the term slider with a pointer and keyboard. */
export function FinancingChoiceDemo() {
  const [selected, setSelected] = useState("leasing");
  const [months, setMonths] = useState(60);
  return (
    <div className="flex max-w-[23rem] flex-col">
      {financing.map((option, index) => (
        <FinancingChoice
          key={option.id}
          title={option.title}
          price={option.price}
          text={option.text}
          selected={selected === option.id}
          bottom={index === financing.length - 1}
          onSelect={() => setSelected(option.id)}
          term={
            option.term
              ? {
                  label: "Avtalslängd",
                  steps: [24, 36, 48, 60, 72, 84],
                  value: months,
                  onChange: setMonths,
                }
              : undefined
          }
          residual={option.term ? { label: "Restvärde", value: "10%" } : undefined}
        />
      ))}
    </div>
  );
}
