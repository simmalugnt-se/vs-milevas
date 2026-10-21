import type { Metadata } from "next";
import { AllFigmaNotes } from "../figma-notes-list";
import { KitchensinkPage } from "../ui";

/** Every question for the designer and every deviation from Figma, from `figma-notes.ts`. */
export const metadata: Metadata = { title: "Kitchensink: Frågor" };

export default function NotesPage() {
  return (
    <KitchensinkPage href="/kitchensink/notes">
      <AllFigmaNotes />
    </KitchensinkPage>
  );
}
