"use client";

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import {
  INSURER_OPTIONS,
  type InsurerOption,
} from "@/lib/insurance-options";

const fieldClass =
  "h-10 w-full rounded-lg border border-dba-border bg-dba-background px-3 text-sm text-dba-charcoal outline-none focus-visible:border-dba-green focus-visible:ring-2 focus-visible:ring-dba-green focus-visible:ring-offset-1";

type InsurerComboboxProps = {
  id?: string;
  name?: string;
  required?: boolean;
};

export function InsurerCombobox({
  id = "insurer",
  name = "insurer",
  required = true,
}: InsurerComboboxProps) {
  const listboxId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<InsurerOption | null>(null);
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle || (selected && query === selected.label)) {
      return INSURER_OPTIONS;
    }
    return INSURER_OPTIONS.filter((option) =>
      option.label.toLowerCase().includes(needle),
    );
  }, [query, selected]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
        if (selected) setQuery(selected.label);
        else setQuery("");
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open, selected]);

  useEffect(() => {
    setHighlightedIndex(0);
  }, [query, open]);

  function selectOption(option: InsurerOption) {
    setSelected(option);
    setQuery(option.label);
    setOpen(false);
    inputRef.current?.focus();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      if (open) {
        event.preventDefault();
        setOpen(false);
        if (selected) setQuery(selected.label);
      }
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (!open) {
        setOpen(true);
        return;
      }
      setHighlightedIndex((index) =>
        filtered.length === 0 ? 0 : (index + 1) % filtered.length,
      );
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (!open) {
        setOpen(true);
        return;
      }
      setHighlightedIndex((index) =>
        filtered.length === 0
          ? 0
          : (index - 1 + filtered.length) % filtered.length,
      );
      return;
    }

    if (event.key === "Enter") {
      if (open && filtered[highlightedIndex]) {
        event.preventDefault();
        selectOption(filtered[highlightedIndex]);
      }
      return;
    }

    if (event.key === "Home" && open && filtered.length > 0) {
      event.preventDefault();
      setHighlightedIndex(0);
      return;
    }

    if (event.key === "End" && open && filtered.length > 0) {
      event.preventDefault();
      setHighlightedIndex(filtered.length - 1);
    }
  }

  const activeOptionId =
    open && filtered[highlightedIndex]
      ? `${listboxId}-option-${filtered[highlightedIndex].value}`
      : undefined;

  return (
    <div ref={containerRef} className="relative">
      <input type="hidden" name={name} value={selected?.value ?? ""} required={required} />

      <div className="relative">
        <input
          ref={inputRef}
          id={id}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-activedescendant={activeOptionId}
          aria-required={required}
          autoComplete="off"
          placeholder="Selecteer of zoek verzekeraar"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setSelected(null);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          className={`${fieldClass} pr-10`}
        />
        <button
          type="button"
          tabIndex={-1}
          aria-label={open ? "Lijst sluiten" : "Lijst openen"}
          onClick={() => {
            setOpen((current) => !current);
            inputRef.current?.focus();
          }}
          className="absolute top-1/2 right-2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-dba-muted transition-colors hover:bg-white hover:text-dba-charcoal"
        >
          <ChevronsUpDown className="h-4 w-4" strokeWidth={1.75} />
        </button>
      </div>

      {open ? (
        <ul
          id={listboxId}
          role="listbox"
          aria-label="Verzekeraars"
          className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-dba-border bg-dba-surface py-1 shadow-[0_1px_2px_rgba(51,53,54,0.06)]"
        >
          {filtered.length === 0 ? (
            <li className="px-3 py-2 text-sm text-dba-muted">
              Geen verzekeraar gevonden
            </li>
          ) : (
            filtered.map((option, index) => {
              const isActive = index === highlightedIndex;
              const isSelected = selected?.value === option.value;
              return (
                <li
                  key={option.value}
                  id={`${listboxId}-option-${option.value}`}
                  role="option"
                  aria-selected={isSelected}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  onMouseDown={(event) => {
                    event.preventDefault();
                    selectOption(option);
                  }}
                  className={`flex cursor-pointer items-center justify-between gap-2 px-3 py-2 text-sm ${
                    isActive
                      ? "bg-dba-background text-dba-charcoal"
                      : "text-dba-charcoal"
                  }`}
                >
                  <span>{option.label}</span>
                  {isSelected ? (
                    <Check
                      className="h-4 w-4 shrink-0 text-dba-green"
                      strokeWidth={2}
                      aria-hidden
                    />
                  ) : null}
                </li>
              );
            })
          )}
        </ul>
      ) : null}

      {selected?.value === "anders" ? (
        <div className="mt-3">
          <label
            htmlFor="insurerOtherName"
            className="mb-1.5 block text-[13px] font-medium text-dba-charcoal"
          >
            Naam verzekeraar
          </label>
          <input
            id="insurerOtherName"
            name="insurerOtherName"
            type="text"
            autoComplete="off"
            placeholder="Vul de naam van de verzekeraar in"
            className={fieldClass}
          />
        </div>
      ) : null}

      {selected?.value === "onbekend" ? (
        <p className="mt-2 text-[12px] leading-relaxed text-dba-muted">
          De verzekeraar moet worden vastgesteld voordat een exacte polismatch
          mogelijk is.
        </p>
      ) : null}
    </div>
  );
}
