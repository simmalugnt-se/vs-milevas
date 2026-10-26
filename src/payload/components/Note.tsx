/**
 * A ui field that only explains, for a block or document with nothing to fill in. Text comes from
 * `clientProps.text`; paragraphs are separated by blank lines.
 */
export function Note({ text }: { text?: string }) {
  if (!text) return null;
  return (
    <div className="field-type" style={{ marginBottom: 0 }}>
      {text.split("\n\n").map((paragraph) => (
        <p key={paragraph} className="field-description" style={{ margin: "0 0 0.5rem" }}>
          {paragraph}
        </p>
      ))}
    </div>
  );
}
