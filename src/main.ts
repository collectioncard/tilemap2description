import './style.css'

export interface Tile {
  id: number;
  image?: string; // Not currently used, but feel free to store a base64 image string here if needed
  description?: string; // Same as above, not currently used
  
  //neighboring tiles in each direction
  up?: Tile[];
  down?: Tile[];
  left?: Tile[];
  right?: Tile[];
}

////////**** EDIT THIS STUFF ****////////

// Utility: Extract edge pixels from a tile image
function getEdgePixels(tileImage: string, tileSize: number) {
  const img = new Image();
  img.src = tileImage;
  const canvas = document.createElement('canvas');
  canvas.width = tileSize;
  canvas.height = tileSize;
  const ctx = canvas.getContext('2d')!;
  
  return new Promise<{ top: Uint8ClampedArray, bottom: Uint8ClampedArray, left: Uint8ClampedArray, right: Uint8ClampedArray }>((resolve) => {
    img.onload = () => {
      ctx.drawImage(img, 0, 0, tileSize, tileSize);
      const imageData = ctx.getImageData(0, 0, tileSize, tileSize).data;

      const top = imageData.slice(0, tileSize * 4);
      const bottom = imageData.slice((tileSize * (tileSize - 1)) * 4, tileSize * tileSize * 4);

      const left = new Uint8ClampedArray(tileSize * 4);
      const right = new Uint8ClampedArray(tileSize * 4);
      for (let y = 0; y < tileSize; y++) {
        left.set(imageData.slice((y * tileSize + 0) * 4, (y * tileSize + 1) * 4), y * 4);
        right.set(imageData.slice((y * tileSize + (tileSize - 1)) * 4, (y * tileSize + tileSize) * 4), y * 4);
      }

      resolve({ top, bottom, left, right });
    };
  });
}

function edgesMatch(
  edgeA: Uint8ClampedArray,
  edgeB: Uint8ClampedArray,
  tolerance = 5,
  matchThreshold = 0.65,
  emptyThreshold = 0.5 // % of pixels allowed to be empty before rejecting
): boolean {
  // Helper: Calculate % of empty pixels (transparent or near-white)
  const emptyRatio = (edge: Uint8ClampedArray) => {
    let emptyCount = 0;
    const totalPixels = edge.length / 4;

    for (let i = 0; i < edge.length; i += 4) {
      const [r, g, b, a] = [edge[i], edge[i+1], edge[i+2], edge[i+3]];
      const isTransparent = a === 0;
      const isNearWhite = a > 0 && r > 240 && g > 240 && b > 240; // optional: treat near-white as empty
      if (isTransparent || isNearWhite) emptyCount++;
    }
    return emptyCount / totalPixels;
  };

  // Skip matching if either edge is mostly empty
  if (emptyRatio(edgeA) >= emptyThreshold || emptyRatio(edgeB) >= emptyThreshold) {
    return false;
  }

  // Count pixel matches
  let matchCount = 0;
  const totalPixels = edgeA.length / 4;
  for (let i = 0; i < edgeA.length; i += 4) {
    const rDiff = Math.abs(edgeA[i] - edgeB[i]);
    const gDiff = Math.abs(edgeA[i + 1] - edgeB[i + 1]);
    const bDiff = Math.abs(edgeA[i + 2] - edgeB[i + 2]);
    const aDiff = Math.abs(edgeA[i + 3] - edgeB[i + 3]);

    if (rDiff <= tolerance && gDiff <= tolerance && bDiff <= tolerance && aDiff <= tolerance) {
      matchCount++;
    }
  }

  return (matchCount / totalPixels) >= matchThreshold;
}



/**
 * Given an array of tiles, update each tile's direction properties
 * by comparing tile edges for visual matches.
 */
export async function updateTileNeighbors(tiles: Tile[], tileSize: number): Promise<void> {
  // Precompute edges for all tiles
  const edgesMap = new Map<number, Awaited<ReturnType<typeof getEdgePixels>>>();
  for (const tile of tiles) {
    edgesMap.set(tile.id, await getEdgePixels(tile.image!, tileSize));
  }

  // Reset neighbors
  tiles.forEach(tile => {
    tile.up = [];
    tile.down = [];
    tile.left = [];
    tile.right = [];
  });

  // Compare all tiles for matching edges
  for (const tileA of tiles) {
    const edgesA = edgesMap.get(tileA.id)!;
    for (const tileB of tiles) {
      if (tileA.id === tileB.id) continue;
      const edgesB = edgesMap.get(tileB.id)!;

      if (edgesMatch(edgesA.top, edgesB.bottom)) tileA.up!.push(tileB);
      if (edgesMatch(edgesA.bottom, edgesB.top)) tileA.down!.push(tileB);
      if (edgesMatch(edgesA.left, edgesB.right)) tileA.left!.push(tileB);
      if (edgesMatch(edgesA.right, edgesB.left)) tileA.right!.push(tileB);

    }
  }
}



////////**** Code to take in a tileset and create array. Only edit if you need to ****////////

const imageInput = document.getElementById('imageInput') as HTMLInputElement;
const tileSizeInput = document.getElementById('tileSizeInput') as HTMLInputElement;
const processBtn = document.getElementById('processBtn') as HTMLButtonElement;

processBtn.onclick = async () => {
  const file = imageInput.files?.[0];
  const tileSize = parseInt(tileSizeInput.value, 10);
  if (!file || isNaN(tileSize) || tileSize <= 0) {
    alert('Please select an image and enter a valid tile size.');
    return;
  }
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
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

      const modalNeighbors = document.createElement('div');
      modalNeighbors.style.display = 'flex';
      modalNeighbors.style.flexWrap = 'wrap';
      modalNeighbors.style.gap = '4px';

      const closeBtn = document.createElement('button');
      closeBtn.innerText = 'Close';
      closeBtn.onclick = () => (modal.style.display = 'none');

      modalContent.appendChild(modalImg);
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
        imgElem.title = `Tile ID: ${tile.id}\n` +
                        `Up: ${tile.up?.length || 0}\n` +
                        `Down: ${tile.down?.length || 0}\n` +
                        `Left: ${tile.left?.length || 0}\n` +
                        `Right: ${tile.right?.length || 0}`;

        // Click to open modal and show neighbors
        imgElem.onclick = () => {
          modalImg.src = tile.image || '';
          modalImg.width = tileSize * 2;
          modalImg.height = tileSize * 2;

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

      document.body.appendChild(tileGallery);
      console.log('Tiles:', tiles);
      alert(`Created ${tiles.length} tiles. Please check the console for details.`);
      //TODO - Thomas - Add code to validate student results.
    };
    img.src = e.target?.result as string;
  };
  reader.readAsDataURL(file);
};
