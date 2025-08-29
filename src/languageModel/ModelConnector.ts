//LLM Implentation (Lorenzo Uk) w/ structured output by Lang Wang
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

import { z } from "zod";

let apiKey = import.meta.env.VITE_GOOGLE_API_KEY;

if (!apiKey) {
  throw new Error("GOOGLE_API_KEY environment variable is not set.");
} else {
  console.log(
    "Google API Key found in environment variable ending in " +
      apiKey.slice(-4),
  );
}

// Zod schema for tile description structured output
export const TileDescriptionSchema = z.object({
  tileId: z.number().describe("The unique identifier of the tile"),

  visualDescription: z
    .string()
    .describe("A detailed visual description of what the tile looks like"),

  tileType: z
    .string()
    .describe(
      "The type or category of the tile (e.g., 'grass', 'stone', 'water', 'building')",
    ),

  features: z
    .array(z.string())
    .describe("List of notable visual features or characteristics"),

  dominantColors: z
    .array(z.string())
    .describe("List of the main colors present in the tile"),

  texture: z
    .string()
    .describe("Description of the texture or material appearance"),

  suggestedUse: z
    .array(z.string())
    .describe("Suggested use cases or contexts for this tile"),

  neighboringCompatibility: z
    .object({
      canConnectUp: z
        .boolean()
        .describe("Whether this tile can connect to tiles above it"),
      canConnectDown: z
        .boolean()
        .describe("Whether this tile can connect to tiles below it"),
      canConnectLeft: z
        .boolean()
        .describe("Whether this tile can connect to tiles to its left"),
      canConnectRight: z
        .boolean()
        .describe("Whether this tile can connect to tiles to its right"),
      compatibilityNotes: z
        .string()
        .describe("Additional notes about how this tile connects with others"),
    })
    .describe(
      "Information about how this tile can connect with neighboring tiles",
    ),

  confidence: z
    .number()
    .min(0)
    .max(1)
    .describe("Confidence score for the analysis (0-1)"),
});

const model = new ChatGoogleGenerativeAI({
  apiKey: apiKey,
  model: "gemini-2.0-flash",
  temperature: 0.3,
}).withStructuredOutput(TileDescriptionSchema);

export async function AnalyzeTileWithLLM(tileId: number, tileImageUrl: string) {
  const messages = [
    new SystemMessage(
      `You are an expert in analyzing and describing tiles used in 2D tile-based games. Your task is to provide a detailed analysis of the visual characteristics, type, and potential uses of each tile based on its image. Use the provided schema to structure your output.`,
    ),
    new HumanMessage(
      `$\nTile ID: ${tileId}\nImage URL: ${tileImageUrl}\nPlease provide your analysis in the specified schema.`,
    ),
  ];

  //TODO: Do something more than this
  const result = await model.invoke(messages);
  console.log("LLM Analysis Result for Tile ID", tileId, ":", result);
  return result;
}
