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
 * @returns Promise<void>
 */
export async function generateTileDescriptions(tiles: Tile[]): Promise<void> {
  try {
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
 * Export tile descriptions as JSON file
 * @param tiles Array of tiles with structured descriptions
 */
export function exportTileDescriptionsAsJSON(tiles: Tile[]): void {
  try {
    // Filter tiles that have structured descriptions
    const tilesWithDescriptions = tiles.filter(tile => tile.structuredDescription);
    
    if (tilesWithDescriptions.length === 0) {
      alert("❌ 没有可导出的结构化描述数据。请先运行AI分析。");
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
    alert(`📥 JSON文件已导出！\n\n文件包含 ${tilesWithDescriptions.length} 个瓦片的结构化描述数据。\n\n这是Issue #4的交付成果：结构化输出JSON格式。`);
    
  } catch (error) {
    console.error('❌ LLM Team - Issue #4: Error exporting JSON:', error);
    alert('❌ 导出JSON文件时出错，请查看控制台了解详情。');
  }
}

/**
 * Add LLM functionality to existing UI
 * This function should be called after tiles are processed
 * @param tiles Array of processed tiles
 * @param containerElement Element to add LLM controls to
 */
export function addLLMControls(tiles: Tile[], containerElement: HTMLElement): LLMOutputInterface {
  // Create LLM analysis button
  const llmButton = document.createElement('button');
  llmButton.textContent = '🤖 Generate AI Descriptions';
  llmButton.style.margin = '10px';
  llmButton.style.padding = '8px 16px';
  llmButton.style.background = '#007bff';
  llmButton.style.color = 'white';
  llmButton.style.border = 'none';
  llmButton.style.borderRadius = '4px';
  llmButton.style.cursor = 'pointer';

  llmButton.onclick = async () => {
    llmButton.disabled = true;
    llmButton.textContent = '🔄 Analyzing...';

    await generateTileDescriptions(tiles);

    llmButton.disabled = false;
    llmButton.textContent = '✅ Complete';

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
    <strong>✅ AI分析完成！</strong><br>
    <small>💡 现在点击瓦片可查看AI生成的详细结构化描述</small>
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
