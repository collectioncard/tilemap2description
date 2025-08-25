//TODO: Move importer team stuff into the right file
import './style.css'
// LLM Team integration - Issue #4: Structured output JSON format
import type { TileDescription } from './languageModel/ModelConnector'
import { addLLMControls } from './languageModel/LLMIntegration'

export interface Tile {
  id: number;
  image?: string; // Not currently used, but feel free to store a base64 image string here if needed
  description?: string; // Same as above, not currently used

  // LLM Team addition - Issue #4: Structured output JSON format
  structuredDescription?: TileDescription; // AI-generated structured description

  //neighboring tiles in each direction
  up?: Tile[];
  down?: Tile[];
  left?: Tile[];
  right?: Tile[];
}

////////**** EDIT THIS STUFF ****////////

/**
 * Given an array of tiles, update each tile's direction properties to indicate which tiles it can tile with in each direction.
 * @param tiles Array of Tile objects to update
 */
export function updateTileNeighbors(tiles: Tile[]): void {
  // Tiles are arranged in a grid, but represented as a 1D array. Starting at index 0, the first tile is in the top-left corner 
  // and the last tile is in the bottom-right corner. A neighboring tile can be added like so:
  //
  //  tiles[0].right = [tiles[1], tiles[2]];
  //
  // This means that tile 0 can tile with tiles 1 and 2 to its right. It's probably best to also put the reciprocal relationship 
  // in place so you can skip some calculations, but the implementation is entirely up to you. I'm just guessing here.
  
  // TODO: implement neighbor assignment logic here
}

// LLM Team functions moved to LLMIntegration.ts for better separation of concerns


////////**** Code to take in a tileset and create array. Only edit if you need to ****////////

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
  const imageInput = document.getElementById('imageInput') as HTMLInputElement;
  const tileSizeInput = document.getElementById('tileSizeInput') as HTMLInputElement;
  const processBtn = document.getElementById('processBtn') as HTMLButtonElement;

  if (!imageInput || !tileSizeInput || !processBtn) {
    console.error('Required DOM elements not found!');
    console.log('imageInput:', imageInput);
    console.log('tileSizeInput:', tileSizeInput);
    console.log('processBtn:', processBtn);
    return;
  }

  console.log('✅ DOM elements found, setting up event listener');

  processBtn.onclick = async () => {
    console.log('🚀 Process button clicked!');
  const file = imageInput.files?.[0];
  const tileSize = parseInt(tileSizeInput.value, 10);
  if (!file || isNaN(tileSize) || tileSize <= 0) {
    alert('Please select an image and enter a valid tile size.');
    return;
  }
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = async () => {
      const cols = Math.floor(img.width / tileSize);
      const rows = Math.floor(img.height / tileSize);
      const tiles: Tile[] = [];
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = tileSize;
      tempCanvas.height = tileSize;
      const tempCtx = tempCanvas.getContext('2d');
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          tempCtx?.clearRect(0, 0, tileSize, tileSize);
          tempCtx?.drawImage(
            img,
            x * tileSize,
            y * tileSize,
            tileSize,
            tileSize,
            0,
            0,
            tileSize,
            tileSize
          );
          const image = tempCanvas.toDataURL();
          tiles.push({
            id: y * cols + x,
            image
          });
        }
      }

      updateTileNeighbors(tiles);

      // Display all tile images on screen
      const tileGallery = document.getElementById('tileGallery') || document.createElement('div');
      tileGallery.id = 'tileGallery';
      tileGallery.innerHTML = '';
      tileGallery.style.display = 'flex';
      tileGallery.style.flexWrap = 'wrap';
      tileGallery.style.gap = '4px';

      // Create modal container
      const modal = document.createElement('div');
      modal.style.position = 'fixed';
      modal.style.top = '0';
      modal.style.left = '0';
      modal.style.width = '100%';
      modal.style.height = '100%';
      modal.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
      modal.style.display = 'none';
      modal.style.alignItems = 'center';
      modal.style.justifyContent = 'center';
      modal.style.zIndex = '1000';

      const modalContent = document.createElement('div');
      modalContent.style.background = '#fff';
      modalContent.style.padding = '20px';
      modalContent.style.borderRadius = '8px';
      modalContent.style.display = 'flex';
      modalContent.style.flexDirection = 'column';
      modalContent.style.alignItems = 'center';
      modalContent.style.gap = '10px';

      const modalImg = document.createElement('img');
      modalImg.style.border = '2px solid #000';

      const modalDescription = document.createElement('div');
      modalDescription.style.maxWidth = '400px';
      modalDescription.style.maxHeight = '200px';
      modalDescription.style.overflow = 'auto';
      modalDescription.style.padding = '10px';
      modalDescription.style.border = '1px solid #ccc';
      modalDescription.style.borderRadius = '4px';
      modalDescription.style.backgroundColor = '#f9f9f9';
      modalDescription.style.fontSize = '14px';

      const modalNeighbors = document.createElement('div');
      modalNeighbors.style.display = 'flex';
      modalNeighbors.style.flexWrap = 'wrap';
      modalNeighbors.style.gap = '4px';

      const closeBtn = document.createElement('button');
      closeBtn.innerText = 'Close';
      closeBtn.onclick = () => (modal.style.display = 'none');

      modalContent.appendChild(modalImg);
      modalContent.appendChild(modalDescription);
      modalContent.appendChild(modalNeighbors);
      modalContent.appendChild(closeBtn);
      modal.appendChild(modalContent);
      document.body.appendChild(modal);

      // ---- END MODAL CREATION ----

      tiles.forEach(tile => {
        const imgElem = document.createElement('img');
        imgElem.src = tile.image || '';
        imgElem.width = tileSize;
        imgElem.height = tileSize;
        imgElem.style.border = '1px solid #ccc';

        // Tooltip on hover
        const tooltipText = `Tile ID: ${tile.id}\n` +
                           `Up: ${tile.up?.length || 0}\n` +
                           `Down: ${tile.down?.length || 0}\n` +
                           `Left: ${tile.left?.length || 0}\n` +
                           `Right: ${tile.right?.length || 0}`;

        if (tile.structuredDescription) {
          imgElem.title = tooltipText + `\n\nType: ${tile.structuredDescription.tileType}\n` +
                         `Description: ${tile.structuredDescription.visualDescription.substring(0, 100)}...`;
        } else {
          imgElem.title = tooltipText;
        }

        // Click to open modal and show neighbors
        imgElem.onclick = () => {
          modalImg.src = tile.image || '';
          modalImg.width = tileSize * 2;
          modalImg.height = tileSize * 2;

          // Show structured description
          if (tile.structuredDescription) {
            const desc = tile.structuredDescription;
            modalDescription.innerHTML = `
              <h3>Tile #${desc.tileId} - ${desc.tileType}</h3>
              <p><strong>Description:</strong> ${desc.visualDescription}</p>
              <p><strong>Features:</strong> ${desc.features.join(', ')}</p>
              <p><strong>Colors:</strong> ${desc.dominantColors.join(', ')}</p>
              <p><strong>Texture:</strong> ${desc.texture}</p>
              <p><strong>Suggested Use:</strong> ${desc.suggestedUse.join(', ')}</p>
              <p><strong>Connectivity:</strong> ${desc.neighboringCompatibility.compatibilityNotes}</p>
              <p><strong>Confidence:</strong> ${(desc.confidence * 100).toFixed(1)}%</p>
            `;
          } else {
            modalDescription.innerHTML = `
              <h3>Tile #${tile.id}</h3>
              <p>No structured description available. LLM analysis may not have been performed.</p>
            `;
          }

          // Show neighbor tiles
          modalNeighbors.innerHTML = '';
          const addNeighbor = (label: string, neighbors?: Tile[]) => {
            if (!neighbors || neighbors.length === 0) return;
            neighbors.forEach(n => {
              const neighborImg = document.createElement('img');
              neighborImg.src = n.image || '';
              neighborImg.width = tileSize;
              neighborImg.height = tileSize;
              neighborImg.style.border = '2px solid #007bff';
              neighborImg.title = `${label} Neighbor: Tile ID ${n.id}`;
              modalNeighbors.appendChild(neighborImg);
            });
          };

          addNeighbor('Up', tile.up);
          addNeighbor('Down', tile.down);
          addNeighbor('Left', tile.left);
          addNeighbor('Right', tile.right);

          modal.style.display = 'flex';
        };

        tileGallery.appendChild(imgElem);
      });

      // Add results to the results div
      const resultsDiv = document.getElementById('results') || document.createElement('div');
      resultsDiv.id = 'results';
      resultsDiv.innerHTML = '';

      // Keep original simple display - no extra instructions

      resultsDiv.appendChild(tileGallery);

      // LLM Team - Issue #4: Add structured output JSON format functionality
      const llmInterface = addLLMControls(tiles, resultsDiv);
      console.log("🔌 LLM Output Interface available:", llmInterface);

      document.body.appendChild(resultsDiv);
      console.log('Tiles:', tiles);
      alert(`Created ${tiles.length} tiles. Please check the console for details.`);
    };
    img.src = e.target?.result as string;
  };
  reader.readAsDataURL(file);
  };

}); // End of DOMContentLoaded event listener
