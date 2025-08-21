//TODO: This stuff
import type { Tile } from "../main.ts";

export class TileMapData {
  private tiles: Tile[] = [];
  private sourceImage: HTMLImageElement | null = null;
  private tileSize: number = 0;

  constructor(image: HTMLImageElement | null, tileSize: number) {
    this.sourceImage = image;
    this.tileSize = tileSize;
    // TODO: call tile-splitting logic here
  }

  /**
   * Return the tile and its data at a given (row, col).
   */
  public GetTileAt(row: number, col: number): Tile | null {
    // TODO: implement using row/col math
    return null;
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
