"use client";

import Image from "next/image";
import { useState } from "react";
import { Choice } from "@/components/ui/choice";
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
      {options.map((option, index) => (
        <Choice
          key={option.id}
          title={option.title}
          price={option.price}
          text={option.text}
          selected={selected === option.id}
          borderRight={index === 0}
          onClick={() => setSelected(option.id)}
          image={<Image src={truckPallet} alt="" fill sizes="16rem" className="object-contain" />}
        />
      ))}
    </div>
  );
}
