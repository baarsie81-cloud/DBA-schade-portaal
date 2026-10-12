import { ShieldCheck } from "lucide-react";

const textareaClass =
  "min-h-[180px] w-full resize-y rounded-lg border border-dba-border bg-dba-background px-3 py-2.5 text-sm leading-relaxed text-dba-charcoal outline-none placeholder:text-dba-muted focus-visible:border-dba-green focus-visible:ring-2 focus-visible:ring-dba-green focus-visible:ring-offset-1";

const attentionPoints = [
  "Wat is er precies gebeurd?",
  "Waar en wanneer is de schade ontstaan?",
  "Wat is beschadigd of verloren gegaan?",
  "Wat is de vermoedelijke oorzaak?",
  "Zijn er al maatregelen genomen?",
  "Is er aanvullende informatie beschikbaar, zoals foto's of een schaderapport?",
] as const;

export function DamageDescriptionForm() {
  return (
    <section className="rounded-xl border border-dba-border bg-dba-surface px-6 py-6 shadow-[0_1px_2px_rgba(51,53,54,0.03)] sm:px-8">
      <div className="mb-6">
        <h2 className="text-base font-semibold text-dba-charcoal">
          Schadeomschrijving
        </h2>
        <p className="mt-1.5 text-sm leading-relaxed text-dba-muted">
          Beschrijf wat er is gebeurd of plak hieronder een geanonimiseerde
          schademelding uit een e-mail.
        </p>
      </div>

      <div>
        <label
          htmlFor="damageDescription"
          className="mb-1.5 block text-[13px] font-medium text-dba-charcoal"
        >
          Wat is er gebeurd? *
        </label>
        <textarea
          id="damageDescription"
          name="damageDescription"
          required
          rows={8}
          placeholder="Beschrijf de schade zo volledig mogelijk. Wat is er gebeurd, wat is beschadigd en wat was de vermoedelijke oorzaak?"
          className={textareaClass}
        />
      </div>

      <div className="mt-5 rounded-lg border border-dba-border bg-dba-background/60 px-4 py-4">
        <p className="text-[13px] font-medium text-dba-charcoal">
          Denk bij je omschrijving aan:
        </p>
        <ul className="mt-3 grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
          {attentionPoints.map((point) => (
            <li
              key={point}
              className="flex gap-2 text-[12.5px] leading-relaxed text-dba-muted"
            >
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-dba-border-strong" />
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-4 flex items-start gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-dba-pill-bg text-dba-pill-text">
          <ShieldCheck className="h-4 w-4" strokeWidth={1.75} />
        </span>
        <p className="pt-1 text-[12.5px] leading-relaxed text-dba-muted">
          Controleer vóór het invoeren of alle namen, adressen,
          contactgegevens, polisnummers en andere herleidbare persoonsgegevens
          zijn verwijderd.
        </p>
      </div>
    </section>
  );
}
