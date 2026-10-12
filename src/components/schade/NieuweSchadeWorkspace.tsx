"use client";

import { useState } from "react";
import {
  EMPTY_POLICY_SEARCH_INPUT,
  type PolicySearchInput,
} from "@/lib/policy-types";
import {
  AdditionalQuestions,
  SAMPLE_QUESTIONS,
  type QuestionAnswer,
} from "./AdditionalQuestions";
import { AiAnalysisPreparation } from "./AiAnalysisPreparation";
import { DamageDescriptionForm } from "./DamageDescriptionForm";
import { InsuranceDetailsForm } from "./InsuranceDetailsForm";
import type { LocalPolicyUploadDocument } from "./PolicyDocumentUpload";
import { PolicySearch } from "./PolicySearch";

export function NieuweSchadeWorkspace() {
  const [policySearchInput, setPolicySearchInput] = useState<PolicySearchInput>(
    EMPTY_POLICY_SEARCH_INPUT,
  );
  const [damageDescription, setDamageDescription] = useState("");
  const [questionAnswers, setQuestionAnswers] = useState<
    Record<string, QuestionAnswer>
  >({});
  const [uploadedDocuments, setUploadedDocuments] = useState<
    LocalPolicyUploadDocument[]
  >([]);

  return (
    <>
      <InsuranceDetailsForm
        value={policySearchInput}
        onChange={setPolicySearchInput}
      />
      <DamageDescriptionForm
        value={damageDescription}
        onChange={setDamageDescription}
      />
      <AdditionalQuestions
        questions={SAMPLE_QUESTIONS}
        answers={questionAnswers}
        onAnswersChange={setQuestionAnswers}
      />
      <PolicySearch
        searchInput={policySearchInput}
        uploadedDocuments={uploadedDocuments}
        onUploadedDocumentsChange={setUploadedDocuments}
      />
      <AiAnalysisPreparation
        policySearchInput={policySearchInput}
        damageDescription={damageDescription}
        questions={SAMPLE_QUESTIONS}
        questionAnswers={questionAnswers}
        uploadedDocuments={uploadedDocuments}
      />
    </>
  );
}
