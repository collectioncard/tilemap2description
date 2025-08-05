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

/**
 * Given an array of tiles, update each tile's direction properties to indicate which tiles 
 * it can tile with in each direction. @param tiles Array of Tile objects to update
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


////////**** Code to take in a tileset and create array. Only edit if you need to ****////////

const imageInput = document.getElementById('imageInput') as HTMLInputElement;
const tileSizeInput = document.getElementById('tileSizeInput') as HTMLInputElement;
const processBtn = document.getElementById('processBtn') as HTMLButtonElement;

processBtn.onclick = () => {
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
      
      console.log('Tiles:', tiles);
      alert(`Created ${tiles.length} tiles. Please check the console for details.`);
      //TODO - Thomas - Add code to validate results.
    };
    img.src = e.target?.result as string;
  };
  reader.readAsDataURL(file);
};
