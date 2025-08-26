//TODO: This stuff
import type { Tile } from "../main.ts";

export class TileMapData {
  private tiles: Tile[] = [];
  private sourceImage: HTMLImageElement;
  private tileSize: number = 0;

  private rows: number = 0;
  private cols: number = 0;

  constructor(image: HTMLImageElement, tileSize: number) {
    this.sourceImage = image;
    this.tileSize = tileSize;
  
    // TODO: call tile-splitting logic here
    this.LoadTilesFromImage(this.sourceImage!);
  }


  public LoadTilesFromImage(img: HTMLImageElement){
        this.tiles = [] //reset

        this.cols = Math.floor(img.width / this.tileSize);
        this.rows = Math.floor(img.height / this.tileSize);
        
        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = this.tileSize;
        tempCanvas.height = this.tileSize;
        const tempCtx = tempCanvas.getContext("2d");
        if (!tempCtx) throw new Error("2D context not available"); //error check

        for (let y = 0; y < this.rows; y++) {
          for (let x = 0; x < this.cols; x++) {
            tempCtx?.clearRect(0, 0, this.tileSize, this.tileSize);
            tempCtx?.drawImage(
              img,
              x * this.tileSize,
              y * this.tileSize,
              this.tileSize,
              this.tileSize,
              0,
              0,
              this.tileSize,
              this.tileSize
            );

            // Clone the canvas so each Tile keeps its own
            const tileCanvas = document.createElement("canvas");
            tileCanvas.width = this.tileSize;
            tileCanvas.height = this.tileSize;
            const tileCtx = tileCanvas.getContext("2d");
            if (!tileCtx) throw new Error("2D context not available");
            tileCtx.drawImage(tempCanvas, 0, 0);

            const tile: Tile = {
              TileID: y * this.cols + x,
              Description: "",
              TileRequirements: "",
              image: tileCanvas,
              imgSize: this.tileSize,
            };

            this.tiles.push(tile);

          }
        }
      }

  /**
   * Return the tile and its data at a given (row, col).
   */
  public GetTileAt(row: number, col: number): Tile {
    // TODO: implement using row/col math
    if (row < 0 || col < 0 || row >= this.cols || col >= this.rows){
            throw new Error("Tile coordinates out of bounds");;
    }
    
    return this.tiles[col * this.cols + row];

  }

  /**
   * Return a "context image" for a tile.
   * Params tbd
   */

  public GetTileContextImg(tileId: number, options?:any): HTMLImageElement {
    const tile = this.tiles.find(t => t.TileID === tileId);
    if (!tile) throw new Error(`Tile with ID ${tileId} not found`);

    const img = new Image();
    img.src = tile.image.toDataURL(); // convert canvas to base64 for HTMLImageElement
    // apply options? (scaling, padding, etc.)
    return img;
  }


  /**
   * Return all tiles.
   */
  public GetTiles(): Tile[] {
    console.log("Tiles: ", this.tiles);
    return this.tiles;
  }

  /**
   * Set custom data for a given tile.
   */
  public SetTileData(tileId: number, data: Partial<Omit<Tile, "TileID"> & { image?: HTMLCanvasElement }>): void {
    const tile = this.tiles.find(t => t.TileID === tileId);
    if (!tile) throw new Error(`Tile with ID ${tileId} not found`);

    Object.assign(tile, data);
  }
}





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
  matchThreshold = 0.625
): boolean {
  let matchCount = 0;
  let validPixelsA = 0;
  let validPixelsB = 0;


  for (let i = 0; i < edgeA.length; i += 4) {
    const [rA, gA, bA, aA] = [edgeA[i], edgeA[i + 1], edgeA[i + 2], edgeA[i + 3]];
    const [rB, gB, bB, aB] = [edgeB[i], edgeB[i + 1], edgeB[i + 2], edgeB[i + 3]];


    const isTransparentA = aA === 0;
    const isTransparentB = aB === 0;
    const isBorderA = (rA === 63 && gA === 38 && bA === 49);
    const isBorderB = (rB === 63 && gB === 38 && bB === 49);


    const isValidA = !(isTransparentA || isBorderA);
    const isValidB = !(isTransparentB || isBorderB);


    if (isValidA) validPixelsA++;
    if (isValidB) validPixelsB++;


    if (isValidA && isValidB) {
      const rDiff = Math.abs(rA - rB);
      const gDiff = Math.abs(gA - gB);
      const bDiff = Math.abs(bA - bB);
      const aDiff = Math.abs(aA - aB);


      if (rDiff <= tolerance && gDiff <= tolerance && bDiff <= tolerance && aDiff <= tolerance) {
        matchCount++;
      }
    }
  }


  // Avoid false matches when one edge is tiny
  if (validPixelsA === 0 || validPixelsB === 0) return false;


  const ratioA = matchCount / validPixelsA;
  const ratioB = matchCount / validPixelsB;


  return ratioA >= matchThreshold && ratioB >= matchThreshold;
}






/**
 * Given an array of tiles, update each tile's direction properties
 * by comparing tile edges for visual matches.
 */
export async function updateTileNeighbors(tiles: Tile[], tileSize: number): Promise<void> {
  // Precompute edges for all tiles
  const edgesMap = new Map<number, Awaited<ReturnType<typeof getEdgePixels>>>();
  for (const tile of tiles) {
    edgesMap.set(tile.TileID, await getEdgePixels(tile.image.toDataURL(), tileSize));
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
    const edgesA = edgesMap.get(tileA.TileID)!;
    for (const tileB of tiles) {
      if (tileA.TileID === tileB.TileID) continue;
      const edgesB = edgesMap.get(tileB.TileID)!;


      if (edgesMatch(edgesA.top, edgesB.bottom)) tileA.up!.push(tileB);
      if (edgesMatch(edgesA.bottom, edgesB.top)) tileA.down!.push(tileB);
      if (edgesMatch(edgesA.left, edgesB.right)) tileA.left!.push(tileB);
      if (edgesMatch(edgesA.right, edgesB.left)) tileA.right!.push(tileB);


    }
  }
}
