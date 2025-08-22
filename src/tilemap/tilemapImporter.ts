//TODO: This stuff
import type { Tile } from "../main.ts";

export class TileMapData {
private tiles: Tile[] = [];
private sourceImage: HTMLImageElement | null = null;
private tileSize: number = 0;
private rows = 0;
private cols = 0;

  constructor(image: HTMLImageElement | null, tileSize: number) {
    this.sourceImage = image;
    this.tileSize = tileSize;
  
    // TODO: call tile-splitting logic here
    this.createTiles(this.sourceImage!);
  }


  private createTiles(img: HTMLImageElement){
        this.cols = Math.floor(img.width / this.tileSize);
        this.rows = Math.floor(img.height / this.tileSize);
        
        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = this.tileSize;
        tempCanvas.height = this.tileSize;
        const tempCtx = tempCanvas.getContext("2d");

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
            const image = tempCanvas.toDataURL();
            this.tiles.push({
              id: y * this.cols + x,
              image,
            });
          }
        }
      }
  /**
   * Return the tile and its data at a given (row, col).
   */
  public GetTileAt(row: number, col: number): Tile | null {
    // TODO: implement using row/col math
    if (row < 0 || col < 0 || row >= this.cols || col >= this.rows){
            return null;
        } else {
            return this.tiles[col * this.cols + row];
        }
  }

  /**
   * Return a "context image" for a tile.
   * Params tbd
   */
  public GetTileContextImg(tileId: number, options?: any): HTMLImageElement | null {
    // TODO: implement feature extraction
    return null;
  }

  /**
   * Return all tiles.
   */
  public GetTiles(): Tile[] {
    return this.tiles;
  }

  /**
   * Set custom data for a given tile.
   */
  public SetTileData(tileId: number, data: any): void {
    const tile = this.tiles.find(t => t.id === tileId);
    if (tile) {
      (tile as any).data = data;
    }
  }

  /**
   * Helper to load tiles (splitting from image).
   * integrate existing loop here.
   */
  public LoadTilesFromImage(): void {
    if (!this.sourceImage || !this.tileSize) return;
    // TODO: implement existing split logic (rows/cols/canvas slicing)
  }
}
