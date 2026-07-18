import type { DemoRiskRuleConfig } from "./types";

export const demoRiskRulesV1: DemoRiskRuleConfig = {
  version: "demo-risk-rules-v1",
  baseScore: 10,
  highThreshold: 70,
  mediumThreshold: 40,
  completenessCap: 94,
  extractionConfidenceMinimum: 0.75,
  weights: { confirmed_weight_gain_1_5kg: 34, breathlessness_mild: 24, orthopnoea_two_pillows: 18, medication_taken: -2, no_salty_meal: -2 }
};
