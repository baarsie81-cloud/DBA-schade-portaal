"use client";

import { useState } from "react";
import {
  EMPTY_POLICY_SEARCH_INPUT,
  type PolicySearchInput,
} from "@/lib/policy-types";
import { AdditionalQuestions } from "./AdditionalQuestions";
import { DamageDescriptionForm } from "./DamageDescriptionForm";
import { InsuranceDetailsForm } from "./InsuranceDetailsForm";
import { PolicySearch } from "./PolicySearch";

export function NieuweSchadeWorkspace() {
  const [policySearchInput, setPolicySearchInput] = useState<PolicySearchInput>(
    EMPTY_POLICY_SEARCH_INPUT,
  );

  return (
    <>
      <InsuranceDetailsForm
        value={policySearchInput}
        onChange={setPolicySearchInput}
      />
      <DamageDescriptionForm />
      <AdditionalQuestions />
      <PolicySearch searchInput={policySearchInput} />
    </>
  );
}
