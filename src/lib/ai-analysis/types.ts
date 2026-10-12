/**
 * Vast schema voor AI-schadeanalyse.
 * Bedoeld voor de handmatige demoworkflow én latere API-integratie.
 */

export type AiCoverageAssessment =
  | "waarschijnlijk_gedekt"
  | "mogelijk_gedekt"
  | "onvoldoende_informatie"
  | "waarschijnlijk_niet_gedekt";

export type AiAnalysisSource = {
  documentnaam: string;
  paginanummer: number;
  artikel: string;
  relevante_passage: string;
};

export type AiAnalysisResult = {
  beoordeling: AiCoverageAssessment;
  samenvatting: string;
  argumenten_voor: string[];
  argumenten_tegen: string[];
  bronnen: AiAnalysisSource[];
  ontbrekende_informatie: string[];
  conceptmail: string;
};

/** Conservatieve bovengrens voor de totale te kopiëren analyseopdracht. */
export const MAX_ANALYSIS_PROMPT_CHARS = 100_000;

export type AiAnalysisAnsweredQuestion = {
  questionId: string;
  prompt: string;
  answer: string;
};

export type AiAnalysisDocumentPage = {
  pageNumber: number;
  text: string;
};

export type AiAnalysisDocumentInput = {
  id: string;
  fileName: string;
  documentType: string;
  documentTypeLabel: string;
  pageCount: number;
  pages: AiAnalysisDocumentPage[];
  totalTextLength: number;
};

export type AiAnalysisPromptInput = {
  insurerValue: string;
  insurerLabel: string;
  insurerOtherName: string;
  insuranceType: string;
  insuranceTypeLabel: string;
  damageDate: string;
  policyConditionCode: string;
  coverageVariant: string;
  damageDescription: string;
  answeredQuestions: AiAnalysisAnsweredQuestion[];
  documents: AiAnalysisDocumentInput[];
};
