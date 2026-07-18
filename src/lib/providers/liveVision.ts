import { validateWeightExtractionResult } from "@/lib/extraction/schema";
import type { VisionProvider, WeightImageInput, WeightExtractionResult } from "./interfaces";

export function createLiveVisionProvider(config: { apiKey?: string; model?: string }): VisionProvider {
  if (!config.apiKey) throw new Error("Live vision provider requires OPENAI_API_KEY; live mode must not fall back to mock extraction.");
  return {
    async extractWeight(_input: WeightImageInput): Promise<WeightExtractionResult> {
      throw new Error(`Live vision extraction adapter boundary configured for ${config.model ?? "vision-model"}; provider call is not implemented in this demo task.`);
    }
  };
}

export function validateLiveVisionOutput(output: unknown): WeightExtractionResult {
  return validateWeightExtractionResult(output);
}
