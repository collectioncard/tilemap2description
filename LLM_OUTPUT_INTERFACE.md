# LLM Team - Output Interface Documentation

## 📋 Interface Overview

The LLM Team provides a standardized output interface that allows other teams to easily access AI analysis result data.

## 🔌 Interface Access Methods

### Global Access
```javascript
// Access in browser console or other code
const llmInterface = window.LLMOutputInterface;
```

### Function Return Value
```javascript
// In main.ts, addLLMControls function returns interface instance
const llmInterface = addLLMControls(tiles, containerElement);
```

## 📚 Interface Methods

### 1. `getAllTileDescriptions()`
Get all analyzed tile descriptions

```javascript
const allDescriptions = llmInterface.getAllTileDescriptions();
console.log("All AI analysis results:", allDescriptions);
```

**Return Value**: `Tile[]` - Array of tiles containing AI descriptions

### 2. `getTileDescription(tileId)`
Get AI description for a specific tile

```javascript
const description = llmInterface.getTileDescription(0);
if (description) {
  console.log("Description for tile 0:", description);
} else {
  console.log("Tile 0 not analyzed or doesn't exist");
}
```

**Parameters**: `tileId: number` - Tile ID
**Return Value**: `TileDescription | null` - AI description object or null

### 3. `getAnalysisStats()`
Get analysis statistics

```javascript
const stats = llmInterface.getAnalysisStats();
console.log("Analysis statistics:", stats);
// Example output:
// {
//   totalTiles: 4,
//   analyzedTiles: 4,
//   analysisComplete: true,
//   averageConfidence: 0.89
// }
```

**Return Value**: Object containing the following fields
- `totalTiles`: Total number of tiles
- `analyzedTiles`: Number of analyzed tiles
- `analysisComplete`: Whether analysis is complete
- `averageConfidence`: Average confidence score

### 4. `exportAsJSON()`
Export data in JSON format

```javascript
const jsonData = llmInterface.exportAsJSON();
console.log("JSON data:", jsonData);

// Save to file
const blob = new Blob([jsonData], { type: 'application/json' });
const url = URL.createObjectURL(blob);
// ... download logic
```

**Return Value**: `string` - Formatted JSON string

### 5. `isAnalysisComplete()`
Check if analysis is complete

```javascript
if (llmInterface.isAnalysisComplete()) {
  console.log("✅ AI analysis completed");
} else {
  console.log("⏳ AI analysis not completed");
}
```

**Return Value**: `boolean` - Analysis completion status

## 🎯 Usage Examples

### Example 1: Get all grass tiles
```javascript
const grassTiles = llmInterface.getAllTileDescriptions()
  .filter(tile => tile.structuredDescription?.tileType === 'grass');
console.log("Grass tiles:", grassTiles);
```

### Example 2: Get high confidence analysis results
```javascript
const highConfidenceTiles = llmInterface.getAllTileDescriptions()
  .filter(tile => tile.structuredDescription?.confidence > 0.8);
console.log("High confidence tiles:", highConfidenceTiles);
```

### Example 3: Monitor analysis completion
```javascript
function checkAnalysisStatus() {
  if (llmInterface.isAnalysisComplete()) {
    const stats = llmInterface.getAnalysisStats();
    console.log(`✅ Analysis complete! ${stats.analyzedTiles}/${stats.totalTiles} tiles analyzed`);
    console.log(`📊 Average confidence: ${(stats.averageConfidence * 100).toFixed(1)}%`);
  } else {
    console.log("⏳ Analysis in progress...");
    setTimeout(checkAnalysisStatus, 1000); // Check again after 1 second
  }
}

checkAnalysisStatus();
```

### Example 4: Integration with other teams
```javascript
// Importers Team can use it like this
function processAIResults() {
  const aiResults = window.LLMOutputInterface?.getAllTileDescriptions();
  if (aiResults) {
    // Use AI results to improve tile matching algorithm
    aiResults.forEach(tile => {
      const desc = tile.structuredDescription;
      if (desc) {
        console.log(`Tile ${tile.id}: ${desc.tileType} - ${desc.visualDescription}`);
        // Adjust matching logic based on AI analysis results
      }
    });
  }
}
```

## 🔄 Data Formats

### TileDescription Structure
```typescript
interface TileDescription {
  tileId: number;
  visualDescription: string;
  tileType: string;
  features: string[];
  dominantColors: string[];
  texture: string;
  suggestedUse: string[];
  neighboringCompatibility: {
    canConnectUp: boolean;
    canConnectDown: boolean;
    canConnectLeft: boolean;
    canConnectRight: boolean;
    compatibilityNotes: string;
  };
  confidence: number; // Between 0-1
}
```

### Tile Structure
```typescript
interface Tile {
  id: number;
  image?: string;
  description?: string;
  structuredDescription?: TileDescription; // Added by LLM Team
  up?: Tile[];
  down?: Tile[];
  left?: Tile[];
  right?: Tile[];
}
```

## ⚠️ Important Notes

1. **Analysis Status Check**: Please check `isAnalysisComplete()` before use
2. **Error Handling**: Methods may return null, please handle errors properly
3. **Performance Considerations**: For large numbers of tiles, consider batch processing
4. **Data Synchronization**: Interface data updates in real-time with AI analysis

## 🤝 Team Collaboration

Other teams can use this interface to:
- **Importers Team**: Leverage AI analysis to improve tile matching algorithms
- **UI Team**: Display AI analysis results and statistics
- **Export Team**: Integrate AI data into export functionality
- **Testing Team**: Validate AI analysis quality and accuracy

## 📞 Contact

If you have questions or need to extend interface functionality, please contact the LLM Team lead.
