//TODO: Implement everything in this file
//

//LLM Implentation (Lorenzo Uk) w/ structured output by Lang Wang
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { z } from "zod";


// Zod schema for tile description structured output
export const TileDescriptionSchema = z.object({
    tileId: z.number().describe("The unique identifier of the tile"),

    visualDescription: z.string().describe("A detailed visual description of what the tile looks like"),

    tileType: z.string().describe("The type or category of the tile (e.g., 'grass', 'stone', 'water', 'building')"),

    features: z.array(z.string()).describe("List of notable visual features or characteristics"),

    dominantColors: z.array(z.string()).describe("List of the main colors present in the tile"),

    texture: z.string().describe("Description of the texture or material appearance"),

    suggestedUse: z.array(z.string()).describe("Suggested use cases or contexts for this tile"),

    neighboringCompatibility: z.object({
        canConnectUp: z.boolean().describe("Whether this tile can connect to tiles above it"),
        canConnectDown: z.boolean().describe("Whether this tile can connect to tiles below it"),
        canConnectLeft: z.boolean().describe("Whether this tile can connect to tiles to its left"),
        canConnectRight: z.boolean().describe("Whether this tile can connect to tiles to its right"),
        compatibilityNotes: z.string().describe("Additional notes about how this tile connects with others")
    }).describe("Information about how this tile can connect with neighboring tiles"),

    confidence: z.number().min(0).max(1).describe("Confidence score for the analysis (0-1)")
});

export type TileDescription = z.infer<typeof TileDescriptionSchema>;


const model = new ChatGoogleGenerativeAI({
  model: "gemini-2.0-flash",
  temperature: .3
}).withStructuredOutput(TileDescriptionSchema);


import { HumanMessage, SystemMessage } from "@langchain/core/messages";

const messages = [
  new SystemMessage("Translate the following from English into Italian"),
  new HumanMessage("hi!"),
];

await model.invoke(messages);