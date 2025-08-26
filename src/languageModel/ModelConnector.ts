import { z } from "zod";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

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

/**
 * ModelConnector class for generating structured tile descriptions using LLM
 */
export class ModelConnector {
  private model: ChatGoogleGenerativeAI;
  private modelWithStructure: any;

  constructor(apiKey?: string) {
    // Initialize Google Gemini model
    this.model = new ChatGoogleGenerativeAI({
      model: "gemini-1.5-flash",
      temperature: 0.3,
      apiKey: apiKey || import.meta.env.VITE_GOOGLE_API_KEY,
    });

    // Bind the schema to the model for structured output
    this.modelWithStructure = this.model.withStructuredOutput(TileDescriptionSchema);
  }

  /**
   * Generate a structured description for a tile based on its image
   * @param tileId - The unique identifier of the tile
   * @param imageBase64 - Base64 encoded image of the tile
   * @returns Promise<TileDescription> - Structured description of the tile
   */
  async generateTileDescription(tileId: number, imageBase64: string): Promise<TileDescription> {
    const prompt = `
Analyze this tile image and provide a detailed structured description.

The tile ID is: ${tileId}

Please analyze the visual characteristics, determine the tile type, identify key features,
note dominant colors, describe the texture, suggest appropriate use cases, and evaluate
how this tile might connect with neighboring tiles in a tilemap.

Consider the following when analyzing:
- Visual appearance and style
- Potential game or application context
- How edges might connect with other tiles
- Overall aesthetic and functional properties

Image data: ${imageBase64}
`;

    try {
      const result = await this.modelWithStructure.invoke(prompt);
      return result as TileDescription;
    } catch (error) {
      console.error("Error generating tile description:", error);
      throw new Error(`Failed to generate tile description: ${error}`);
    }
  }

  /**
   * Generate descriptions for multiple tiles
   * @param tiles - Array of tiles with id and image data
   * @returns Promise<TileDescription[]> - Array of structured descriptions
   */
  async generateMultipleTileDescriptions(tiles: Array<{id: number, image: string}>): Promise<TileDescription[]> {
    const descriptions: TileDescription[] = [];

    for (const tile of tiles) {
      try {
        const description = await this.generateTileDescription(tile.id, tile.image);
        descriptions.push(description);
      } catch (error) {
        console.error(`Failed to generate description for tile ${tile.id}:`, error);
        // Continue with other tiles even if one fails
      }
    }

    return descriptions;
  }
}

