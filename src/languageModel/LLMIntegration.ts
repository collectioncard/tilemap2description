/**
 * LLM Integration Module - Issue #4
 * 
 * This module provides integration between the main application and the LLM system.
 * It serves as a bridge between the tile processing system and the ModelConnector.
 * 
 * Responsibilities:
 * - Coordinate between main app and LLM analysis
 * - Handle progress tracking and user feedback
 * - Manage API key input and validation
 * - Export structured JSON data
 * 
 * @author LLM Team - Issue #4 contributor
 */

import { ModelConnector } from './ModelConnector';
import type { TileDescription } from './ModelConnector';

export interface Tile {
  id: number;
  image?: string;
  description?: string;
  structuredDescription?: TileDescription;
  up?: Tile[];
  down?: Tile[];
  left?: Tile[];
  right?: Tile[];
}

/**
 * Generate structured descriptions for tiles using LLM
 * @param tiles Array of Tile objects to generate descriptions for
 * @param demoMode Whether to use demo mode (no API calls)
 * @returns Promise<void>
 */
export async function generateTileDescriptions(tiles: Tile[], demoMode: boolean = false): Promise<void> {
  try {
    if (demoMode) {
      console.log("🎭 Running in demo mode - generating mock descriptions");
      await generateDemoDescriptions(tiles);
      return;
    }

    // Use embedded API key for seamless experience
    const apiKey = "AIzaSyDgy5LWDCXpgQRi8nTpvDqCmDwUJklsH84";

    console.log("🔑 Using embedded API key for LLM analysis");
    const modelConnector = new ModelConnector(apiKey);
    
    // Show progress indicator
    const progressDiv = document.createElement('div');
    progressDiv.id = 'llm-progress';
    progressDiv.style.position = 'fixed';
    progressDiv.style.top = '50%';
    progressDiv.style.left = '50%';
    progressDiv.style.transform = 'translate(-50%, -50%)';
    progressDiv.style.background = 'white';
    progressDiv.style.padding = '20px';
    progressDiv.style.border = '2px solid #007bff';
    progressDiv.style.borderRadius = '8px';
    progressDiv.style.zIndex = '9999';
    progressDiv.innerHTML = 'Generating tile descriptions... 0/' + tiles.length;
    document.body.appendChild(progressDiv);

    // Generate descriptions for each tile
    for (let i = 0; i < tiles.length; i++) {
      const tile = tiles[i];
      if (tile.image) {
        try {
          progressDiv.innerHTML = `Generating tile descriptions... ${i + 1}/${tiles.length}`;
          const description = await modelConnector.generateTileDescription(tile.id, tile.image);
          tile.structuredDescription = description;
          console.log(`Generated description for tile ${tile.id}:`, description);
        } catch (error) {
          console.error(`Failed to generate description for tile ${tile.id}:`, error);
        }
      }
    }

    // Remove progress indicator
    document.body.removeChild(progressDiv);

    console.log("✅ LLM Team - Issue #4: Finished generating structured tile descriptions");
  } catch (error) {
    console.error("❌ LLM Team - Issue #4: Error in generateTileDescriptions:", error);
    alert("Error generating tile descriptions. Check console for details.");
  }
}

/**
 * Generate demo descriptions for tiles (no API calls)
 * @param tiles Array of Tile objects to generate descriptions for
 * @returns Promise<void>
 */
async function generateDemoDescriptions(tiles: Tile[]): Promise<void> {
  const tileTypes = ['grass', 'stone', 'water', 'dirt', 'sand', 'rock', 'wood', 'metal'];
  const colors = [
    ['green', 'dark green', 'light green'],
    ['gray', 'dark gray', 'light gray'],
    ['blue', 'light blue', 'dark blue'],
    ['brown', 'dark brown', 'tan'],
    ['yellow', 'beige', 'light brown'],
    ['black', 'dark gray', 'charcoal'],
    ['brown', 'tan', 'dark brown'],
    ['silver', 'gray', 'dark silver']
  ];

  // Show progress indicator
  const progressDiv = document.createElement('div');
  progressDiv.id = 'llm-progress';
  progressDiv.style.position = 'fixed';
  progressDiv.style.top = '50%';
  progressDiv.style.left = '50%';
  progressDiv.style.transform = 'translate(-50%, -50%)';
  progressDiv.style.background = 'white';
  progressDiv.style.padding = '20px';
  progressDiv.style.border = '2px solid #007bff';
  progressDiv.style.borderRadius = '8px';
  progressDiv.style.zIndex = '9999';
  progressDiv.innerHTML = '🎭 Generating demo descriptions... 0/' + tiles.length;
  document.body.appendChild(progressDiv);

  // Generate demo descriptions for each tile
  for (let i = 0; i < tiles.length; i++) {
    const tile = tiles[i];
    const typeIndex = i % tileTypes.length;
    const tileType = tileTypes[typeIndex];
    const tileColors = colors[typeIndex];

    progressDiv.innerHTML = `🎭 Generating demo descriptions... ${i + 1}/${tiles.length}`;
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));

    const demoDescription: TileDescription = {
      tileId: tile.id,
      visualDescription: `A ${tileType} tile with detailed texture and realistic appearance. This tile shows typical ${tileType} characteristics with natural variations and patterns.`,
      tileType: tileType,
      features: [`${tileType} texture`, 'natural patterns', 'seamless edges'],
      dominantColors: tileColors,
      texture: `${tileType} surface with natural texture`,
      suggestedUse: [`${tileType} areas`, 'terrain building', 'landscape design'],
      neighboringCompatibility: {
        canConnectUp: Math.random() > 0.3,
        canConnectDown: Math.random() > 0.3,
        canConnectLeft: Math.random() > 0.3,
        canConnectRight: Math.random() > 0.3,
        compatibilityNotes: `This ${tileType} tile can connect with similar terrain types and some transitional tiles.`
      },
      confidence: 0.85 + Math.random() * 0.1 // Random confidence between 0.85-0.95
    };

    tile.structuredDescription = demoDescription;
    console.log(`Generated demo description for tile ${tile.id}:`, demoDescription);
  }

  // Remove progress indicator
  document.body.removeChild(progressDiv);
  console.log("✅ Demo mode - Finished generating mock tile descriptions");
}

/**
 * Export tile descriptions as JSON file
 * @param tiles Array of tiles with structured descriptions
 */
export function exportTileDescriptionsAsJSON(tiles: Tile[]): void {
  try {
    // Filter tiles that have structured descriptions
    const tilesWithDescriptions = tiles.filter(tile => tile.structuredDescription);
    
    if (tilesWithDescriptions.length === 0) {
      alert("❌ No structured description data to export. Please run AI analysis first.");
      return;
    }

    // Create the JSON data structure - Issue #4 format
    const exportData = {
      metadata: {
        exportDate: new Date().toISOString(),
        totalTiles: tilesWithDescriptions.length,
        version: "1.0",
        description: "AI-generated structured descriptions for tilemap tiles",
        generatedBy: "LLM Team - Issue #4: Structured output JSON format"
      },
      tiles: tilesWithDescriptions.map(tile => ({
        id: tile.id,
        structuredDescription: tile.structuredDescription
      }))
    };

    // Convert to JSON string with pretty formatting
    const jsonString = JSON.stringify(exportData, null, 2);

    // Create blob and download link
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Create temporary download link
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = `tilemap_descriptions_${new Date().toISOString().split('T')[0]}.json`;
    
    // Trigger download
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    
    // Clean up
    URL.revokeObjectURL(url);
    
    console.log('✅ LLM Team - Issue #4: JSON file exported successfully');
    alert(`📥 JSON file exported successfully!\n\nFile contains structured description data for ${tilesWithDescriptions.length} tiles.\n\nThis is the deliverable for Issue #4: Structured output JSON format.`);
    
  } catch (error) {
    console.error('❌ LLM Team - Issue #4: Error exporting JSON:', error);
    alert('❌ Error exporting JSON file. Check console for details.');
  }
}

/**
 * Add LLM functionality to existing UI
 * This function should be called after tiles are processed
 * @param tiles Array of processed tiles
 * @param containerElement Element to add LLM controls to
 */
export function addLLMControls(tiles: Tile[], containerElement: HTMLElement): LLMOutputInterface {
  // Create demo mode button
  const demoButton = document.createElement('button');
  demoButton.textContent = '🎭 Demo Mode (No API)';
  demoButton.style.margin = '10px';
  demoButton.style.padding = '8px 16px';
  demoButton.style.background = '#28a745';
  demoButton.style.color = 'white';
  demoButton.style.border = 'none';
  demoButton.style.borderRadius = '4px';
  demoButton.style.cursor = 'pointer';

  demoButton.onclick = async () => {
    demoButton.disabled = true;
    demoButton.textContent = '🔄 Generating Demo...';

    await generateTileDescriptions(tiles, true); // Demo mode

    demoButton.disabled = false;
    demoButton.textContent = '✅ Demo Complete';

    // Show export button
    exportButton.style.display = 'inline-block';

    // Show permanent usage instructions
    showPermanentAIInstructions(llmControlsDiv);
  };

  // Create real AI analysis button
  const llmButton = document.createElement('button');
  llmButton.textContent = '🤖 Real AI Analysis';
  llmButton.style.margin = '10px';
  llmButton.style.padding = '8px 16px';
  llmButton.style.background = '#007bff';
  llmButton.style.color = 'white';
  llmButton.style.border = 'none';
  llmButton.style.borderRadius = '4px';
  llmButton.style.cursor = 'pointer';

  llmButton.onclick = async () => {
    const confirmReal = confirm('⚠️ Warning: This will use real Google Gemini API calls and may consume your quota.\n\nIf quota is exhausted, we recommend using "Demo Mode" to experience the functionality.\n\nDo you want to continue?');
    if (!confirmReal) return;

    llmButton.disabled = true;
    llmButton.textContent = '🔄 Real AI Analyzing...';

    await generateTileDescriptions(tiles, false); // Real API mode

    llmButton.disabled = false;
    llmButton.textContent = '✅ AI Complete';

    // Show export button
    exportButton.style.display = 'inline-block';

    // Show permanent usage instructions
    showPermanentAIInstructions(llmControlsDiv);
  };

  // Create export button (initially hidden)
  const exportButton = document.createElement('button');
  exportButton.textContent = '📥 Export JSON';
  exportButton.style.margin = '10px';
  exportButton.style.padding = '8px 16px';
  exportButton.style.background = '#28a745';
  exportButton.style.color = 'white';
  exportButton.style.border = 'none';
  exportButton.style.borderRadius = '4px';
  exportButton.style.cursor = 'pointer';
  exportButton.style.display = 'none';
  
  exportButton.onclick = () => exportTileDescriptionsAsJSON(tiles);

  // Add buttons to container - minimal integration
  const llmControlsDiv = document.createElement('div');
  llmControlsDiv.style.textAlign = 'center';
  llmControlsDiv.style.margin = '20px 0';
  llmControlsDiv.style.padding = '10px';
  llmControlsDiv.style.borderTop = '1px solid #ddd';

  // Add info text
  const infoText = document.createElement('p');
  infoText.innerHTML = '💡 <strong>Recommended: Use Demo Mode</strong> to experience features without API quota';
  infoText.style.color = '#666';
  infoText.style.fontSize = '14px';
  infoText.style.margin = '10px 0';

  llmControlsDiv.appendChild(infoText);
  llmControlsDiv.appendChild(demoButton);
  llmControlsDiv.appendChild(llmButton);
  llmControlsDiv.appendChild(exportButton);

  containerElement.appendChild(llmControlsDiv);

  // Create and return output interface
  const outputInterface = createOutputInterface(tiles);

  // Make interface globally accessible for other teams
  (window as any).LLMOutputInterface = outputInterface;

  console.log("🔌 LLM Team - Issue #4: Output interface created and available globally");
  console.log("📋 Usage: window.LLMOutputInterface.getAllTileDescriptions()");

  return outputInterface;
}

/**
 * Show permanent AI usage instructions after analysis is complete
 */
function showPermanentAIInstructions(container: HTMLElement): void {
  // Create a permanent instruction box
  const instructionBox = document.createElement('div');
  instructionBox.style.margin = '15px 0';
  instructionBox.style.padding = '15px';
  instructionBox.style.background = '#e8f5e8';
  instructionBox.style.color = '#2e7d32';
  instructionBox.style.borderRadius = '8px';
  instructionBox.style.border = '1px solid #4caf50';
  instructionBox.style.fontSize = '14px';
  instructionBox.innerHTML = `
    <strong>✅ AI Analysis Complete!</strong><br>
    <small>💡 Now click on tiles to view detailed AI-generated structured descriptions</small>
  `;

  container.appendChild(instructionBox);
}

/**
 * Output Interface - Get AI analysis results
 * This interface allows other teams to access the AI-generated tile descriptions
 */
export interface LLMOutputInterface {
  /**
   * Get all tiles with their AI descriptions
   * @returns Array of tiles with structured descriptions
   */
  getAllTileDescriptions(): Tile[];

  /**
   * Get AI description for a specific tile
   * @param tileId The ID of the tile
   * @returns TileDescription or null if not found
   */
  getTileDescription(tileId: number): TileDescription | null;

  /**
   * Get analysis statistics
   * @returns Object with analysis statistics
   */
  getAnalysisStats(): {
    totalTiles: number;
    analyzedTiles: number;
    analysisComplete: boolean;
    averageConfidence: number;
  };

  /**
   * Export data in JSON format
   * @returns JSON string of all tile descriptions
   */
  exportAsJSON(): string;

  /**
   * Check if AI analysis has been performed
   * @returns boolean indicating if analysis is complete
   */
  isAnalysisComplete(): boolean;
}

// Global reference to current tiles data
let currentTilesData: Tile[] = [];

/**
 * Create output interface instance
 * @param tiles Array of tiles with AI descriptions
 * @returns LLMOutputInterface instance
 */
export function createOutputInterface(tiles: Tile[]): LLMOutputInterface {
  currentTilesData = tiles;

  return {
    getAllTileDescriptions(): Tile[] {
      return currentTilesData.filter(tile => tile.structuredDescription);
    },

    getTileDescription(tileId: number): TileDescription | null {
      const tile = currentTilesData.find(t => t.id === tileId);
      return tile?.structuredDescription || null;
    },

    getAnalysisStats() {
      const totalTiles = currentTilesData.length;
      const analyzedTiles = currentTilesData.filter(t => t.structuredDescription).length;
      const confidenceSum = currentTilesData
        .filter(t => t.structuredDescription)
        .reduce((sum, t) => sum + (t.structuredDescription?.confidence || 0), 0);

      return {
        totalTiles,
        analyzedTiles,
        analysisComplete: analyzedTiles === totalTiles && totalTiles > 0,
        averageConfidence: analyzedTiles > 0 ? confidenceSum / analyzedTiles : 0
      };
    },

    exportAsJSON(): string {
      const exportData = {
        metadata: {
          exportDate: new Date().toISOString(),
          totalTiles: currentTilesData.length,
          analyzedTiles: currentTilesData.filter(t => t.structuredDescription).length,
          version: "1.0",
          description: "AI-generated structured descriptions for tilemap tiles",
          generatedBy: "LLM Team - Issue #4: Structured output JSON format"
        },
        tiles: currentTilesData
          .filter(tile => tile.structuredDescription)
          .map(tile => ({
            id: tile.id,
            structuredDescription: tile.structuredDescription
          }))
      };

      return JSON.stringify(exportData, null, 2);
    },

    isAnalysisComplete(): boolean {
      const stats = this.getAnalysisStats();
      return stats.analysisComplete;
    }
  };
}
