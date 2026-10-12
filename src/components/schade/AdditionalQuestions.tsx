"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Info } from "lucide-react";

export type TextQuestion = {
  id: string;
  prompt: string;
  type: "text";
};

export type YesNoUnknownQuestion = {
  id: string;
  prompt: string;
  type: "yes_no_unknown";
};

export type AdditionalQuestion = TextQuestion | YesNoUnknownQuestion;

export type QuestionAnswer = string;

const SAMPLE_QUESTIONS: AdditionalQuestion[] = [
  {
    id: "cause",
    prompt: "Wat is de vermoedelijke oorzaak van de schade?",
    type: "text",
  },
  {
    id: "measures",
    prompt:
      "Zijn er al maatregelen genomen om verdere schade te voorkomen?",
    type: "yes_no_unknown",
  },
  {
    id: "extra-info",
    prompt:
      "Is er aanvullende informatie beschikbaar, zoals foto's of een schaderapport?",
    type: "yes_no_unknown",
  },
];

const YES_NO_UNKNOWN_OPTIONS = [
  { value: "ja", label: "Ja" },
  { value: "nee", label: "Nee" },
  { value: "onbekend", label: "Onbekend" },
] as const;

const fieldClass =
  "h-10 w-full rounded-lg border border-dba-border bg-dba-background px-3 text-sm text-dba-charcoal outline-none focus-visible:border-dba-green focus-visible:ring-2 focus-visible:ring-dba-green focus-visible:ring-offset-1";

const labelClass = "mb-1.5 block text-[13px] font-medium text-dba-charcoal";

const toggleButtonClass =
  "inline-flex h-9 items-center gap-1.5 rounded-lg border border-dba-border bg-white px-3 text-[13px] font-medium text-dba-muted transition-colors hover:bg-dba-background hover:text-dba-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dba-green focus-visible:ring-offset-1";

type AdditionalQuestionsProps = {
  questions?: AdditionalQuestion[];
};

export function AdditionalQuestions({
  questions = SAMPLE_QUESTIONS,
}: AdditionalQuestionsProps) {
  const [visible, setVisible] = useState(true);
  const [answers, setAnswers] = useState<Record<string, QuestionAnswer>>({});

  function setAnswer(id: string, value: string) {
    setAnswers((current) => ({ ...current, [id]: value }));
  }

  return (
    <section className="rounded-xl border border-dba-border bg-dba-surface px-6 py-6 shadow-[0_1px_2px_rgba(51,53,54,0.03)] sm:px-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-dba-charcoal">
            Aanvullende informatie
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-dba-muted">
            Afhankelijk van de schade kunnen aanvullende gegevens nodig zijn
            voor een goede beoordeling.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          className={toggleButtonClass}
          aria-expanded={visible}
        >
          {visible ? (
            <>
              <ChevronUp className="h-3.5 w-3.5" strokeWidth={2} />
              Vragen verbergen
            </>
          ) : (
            <>
              <ChevronDown className="h-3.5 w-3.5" strokeWidth={2} />
              Vragen tonen
            </>
          )}
        </button>
      </div>

      {visible ? (
        <div className="mt-5 space-y-5">
          <div className="flex items-start gap-2.5 rounded-lg border border-dba-border bg-dba-background/60 px-3 py-2.5">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-dba-pill-bg text-dba-pill-text">
              <Info className="h-3.5 w-3.5" strokeWidth={1.75} />
            </span>
            <p className="pt-0.5 text-[12.5px] leading-relaxed text-dba-muted">
              Dit zijn voorbeeldvragen. In een volgende fase worden de vragen
              automatisch bepaald op basis van de schadeomschrijving en
              polisvoorwaarden.
            </p>
          </div>

          {questions.map((question) => (
            <div key={question.id}>
              {question.type === "text" ? (
                <>
                  <label htmlFor={question.id} className={labelClass}>
                    {question.prompt}
                  </label>
                  <input
                    id={question.id}
                    name={question.id}
                    type="text"
                    autoComplete="off"
                    value={answers[question.id] ?? ""}
                    onChange={(event) =>
                      setAnswer(question.id, event.target.value)
                    }
                    className={fieldClass}
                  />
                </>
              ) : (
                <>
                  <p id={`${question.id}-label`} className={labelClass}>
                    {question.prompt}
                  </p>
                  <div
                    role="radiogroup"
                    aria-labelledby={`${question.id}-label`}
                    className="flex flex-wrap gap-2"
                  >
                    {YES_NO_UNKNOWN_OPTIONS.map((option) => {
                      const optionId = `${question.id}-${option.value}`;
                      const checked = answers[question.id] === option.value;
                      return (
                        <label
                          key={option.value}
                          htmlFor={optionId}
                          className={`inline-flex h-10 cursor-pointer items-center rounded-lg border px-4 text-sm font-medium transition-colors ${
                            checked
                              ? "border-dba-green bg-[#eef6f2] text-dba-dark-green"
                              : "border-dba-border bg-dba-background text-dba-charcoal hover:bg-white"
                          }`}
                        >
                          <input
                            id={optionId}
                            type="radio"
                            name={question.id}
                            value={option.value}
                            checked={checked}
                            onChange={() =>
                              setAnswer(question.id, option.value)
                            }
                            className="sr-only"
                          />
                          {option.label}
                        </label>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}
