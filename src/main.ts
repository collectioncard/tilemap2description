//TODO: Move importer team stuff into the right file
import './style.css'

import { type Tile, updateTileNeighbors, TileMapData } from './tilemap/tilemapImporter.ts'

////////**** Code to take in a tileset and create array. Only edit if you need to ****////////


const imageInput = document.getElementById('imageInput') as HTMLInputElement;
const tileSizeInput = document.getElementById('tileSizeInput') as HTMLInputElement;
const processBtn = document.getElementById('processBtn') as HTMLButtonElement;

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
      const tileMap = new TileMapData(img, tileSize);
      const tiles = tileMap.GetTiles();
      const cols = (tileMap as any).cols;
      const rows = (tileMap as any).rows;


      updateTileNeighbors(tiles, tileSize);


      // Display all tile images on screen
      const tileGallery = document.getElementById('tileGallery') || document.createElement('div');
      tileGallery.id = 'tileGallery';
      tileGallery.innerHTML = '';
      tileGallery.style.display = 'grid';
      tileGallery.style.gridTemplateColumns = `repeat(${cols}, ${tileSize}px)`;
      tileGallery.style.gridTemplateRows = `repeat(${rows}, ${tileSize}px)`;
      tileGallery.style.gap = '1px'; // or '1px' if you want spacing
      tileGallery.style.width = `${cols * tileSize}px`;
      tileGallery.style.border = '1px solid #ccc'; // optional visual edge


      tiles.forEach(tile => {
        const imgElem = document.createElement('img');
        imgElem.src = tile.image.toDataURL() || '';
        imgElem.width = tileSize;
        imgElem.height = tileSize;
        imgElem.style.border = '1px solid #ccc';


        // Tooltip on hover
        imgElem.title = `Tile ID: ${tile.TileID}\n` +
                        `Up: ${tile.up?.length || 0}\n` +
                        `Down: ${tile.down?.length || 0}\n` +
                        `Left: ${tile.left?.length || 0}\n` +
                        `Right: ${tile.right?.length || 0}`;


        // Click to open modal and show neighbors
        imgElem.onclick = () => {
          modalImg.src = tile.image.toDataURL() || '';
          modalImg.width = tileSize * 2;
          modalImg.height = tileSize * 2;


          // Show neighbor tiles
          modalNeighbors.innerHTML = '';
          const addNeighbor = (label: string, neighbors?: Tile[]) => {
            if (!neighbors || neighbors.length === 0) return;
            neighbors.forEach(n => {
              const neighborImg = document.createElement('img');
              neighborImg.src = n.image.toDataURL() || '';
              neighborImg.width = tileSize;
              neighborImg.height = tileSize;
              neighborImg.style.border = '2px solid #007bff';
              neighborImg.title = `${label} Neighbor: Tile ID ${n.TileID}`;
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
      console.log('Tiles:', tiles); //GetTiles Output gives the same results
      alert(`Created ${tiles.length} tiles. Please check the console for details.`);

      //Zikria Test data
      // Test for SetTileData
      tileMap.SetTileData(104, {
      Description: "Bottom Well Tile",
      TileRequirements: "Must be used with tile 92"
      });

      console.log(tileMap.GetTiles()[104]);

    };
    img.src = e.target?.result as string;
  };
  reader.readAsDataURL(file);
};



