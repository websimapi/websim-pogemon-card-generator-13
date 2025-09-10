import { createMiniCard } from './components/miniCard.js';
import { showToast } from './utils.js';
import { getAllCards, saveCard, deleteCard } from './db.js';
import { loadCardToMain } from './components/card.js';
import { sendToPoGePalace } from './palace.js';
import { displayFilteredCards, showCollection } from './collection.js';

let showingPalace = false;
export const isShowingPalace = () => showingPalace;
export const setShowingPalace = (value) => {
  showingPalace = value;
};

export async function createCollectionViewer() {
  // First remove any existing viewer
  const existingViewer = document.querySelector('.collection-viewer');
  if (existingViewer) {
    existingViewer.remove();
  }

  const viewer = document.createElement('div');
  viewer.className = 'collection-viewer hidden';
  viewer.innerHTML = `
    <div class="collection-header">
      <div class="collection-header-title">
        <h2>Your PoGeFlex Collection</h2>
        <button class="import-btn" title="Import Collection">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" transform="rotate(180, 12, 12)"/>
          </svg>
        </button>
        <button class="export-btn" title="Export Collection">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
          </svg>
        </button>
        <button class="palace-toggle-btn" title="Go to PoGePalace">
          <svg class="palace-view-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3zm3 13v3h-2v-3h2z"/>
          </svg>
          <svg class="flex-view-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style="display: none;">
            <path d="M4 6h18V4H4c-1.1 0-2 .9-2 2v11H0v3h14v-3H4V6zm19 2h-6c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h6c.55 0 1-.45 1-1V9c0-.55-.45-1-1-1zm-1 9h-4v-7h4v7z"/>
          </svg>
        </button>
        <input type="file" class="hidden-file-input" accept=".json">
      </div>
      <div class="collection-header-buttons">
        <button class="delete-mode-toggle" title="Toggle Delete Mode">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 4h-3.5l-1-1h-5l-1 1H5v2h14M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12z"/>
          </svg>
        </button>
        <button class="close-collection" aria-label="Close Collection View" title="Close">×</button>
      </div>
    </div>
    <div class="collection-tabs">
      <button class="type-tab active" data-type="all">
        <span>ALL</span>
      </button>
    </div>
    <div class="collection-grid"></div>
  `;
  document.body.appendChild(viewer);

  // Add event listeners for the buttons
  const closeBtn = viewer.querySelector('.close-collection');
  const deleteToggle = viewer.querySelector('.delete-mode-toggle');
  const exportBtn = viewer.querySelector('.export-btn');
  const importBtn = viewer.querySelector('.import-btn');
  const fileInput = viewer.querySelector('.hidden-file-input');
  const palaceToggleBtn = viewer.querySelector('.palace-toggle-btn');
  let deleteMode = false;

  palaceToggleBtn.addEventListener('click', async () => {
    showingPalace = !showingPalace;
    palaceToggleBtn.classList.toggle('active');
    
    // Update button title and icons
    const palaceIcon = palaceToggleBtn.querySelector('.palace-view-icon');
    const flexIcon = palaceToggleBtn.querySelector('.flex-view-icon');
    
    if (showingPalace) {
      palaceToggleBtn.title = 'Go to PoGeFlex';
      palaceIcon.style.display = 'none';
      flexIcon.style.display = '';
    } else {
      palaceToggleBtn.title = 'Go to PoGePalace';
      palaceIcon.style.display = '';
      flexIcon.style.display = 'none';
    }
    
    const title = viewer.querySelector('h2');
    const grid = viewer.querySelector('.collection-grid');
    grid.innerHTML = '';

    if (showingPalace) {
      title.textContent = 'PoGePalace Collection';
      deleteToggle.style.display = 'none'; // Hide delete toggle in palace view
      importBtn.style.display = 'none';
      exportBtn.style.display = 'none';
      
      try {
        const pogepalace = new WebsimSocket();
        const pogemons = await pogepalace.collection('pogemon').getList();
        
        displayFilteredCards(pogemons, [], 'single', true); // Pass true for isPalaceView

        // Subscribe to real-time updates
        pogepalace.collection('pogemon').subscribe((updatedPogemons) => {
          if (showingPalace) { // Only update if still showing palace
            grid.innerHTML = '';
            displayFilteredCards(updatedPogemons, [], 'single', true); // Pass true for isPalaceView
          }
        });
      } catch (error) {
        console.error('Error loading PoGePalace collection:', error);
        showToast('Failed to load PoGePalace collection', true);
      }
    } else {
      title.textContent = 'Your PoGeFlex Collection';
      deleteToggle.style.display = ''; // Show delete toggle in flex view
      importBtn.style.display = '';
      exportBtn.style.display = '';
      
      // Load local collection
      const cards = await getAllCards();
      cards.sort((a, b) => b.timestamp - a.timestamp);
      displayFilteredCards(cards, [], 'single');
    }
  });

  closeBtn.addEventListener('click', () => {
    viewer.classList.add('hidden');
    deleteMode = false;
    deleteToggle.classList.remove('active');
    const cards = viewer.querySelectorAll('.mini-card');
    cards.forEach(card => card.classList.remove('delete-mode'));
    
    // Reset to PoGeFlex view for next open
    if (showingPalace) {
      showingPalace = false;
      palaceToggleBtn.classList.remove('active');
      const title = viewer.querySelector('h2');
      title.textContent = 'Your PoGeFlex Collection';
      deleteToggle.style.display = '';
      importBtn.style.display = '';
      exportBtn.style.display = '';
      
      // Load PoGeFlex collection
      getAllCards().then(cards => {
        cards.sort((a, b) => b.timestamp - a.timestamp);
        displayFilteredCards(cards, [], 'single');
      });
    }
  });

  deleteToggle.addEventListener('click', () => {
    deleteMode = !deleteMode;
    deleteToggle.classList.toggle('active');
    const cards = viewer.querySelectorAll('.mini-card');
    cards.forEach(card => {
      card.classList.toggle('delete-mode');
      
      // Remove existing click handlers
      const newCard = card.cloneNode(true);
      card.parentNode.replaceChild(newCard, card);
      
      // Add appropriate click handler based on mode
      if (deleteMode) {
        newCard.addEventListener('click', async (e) => {
          e.stopPropagation();
          const cardData = newCard.cardData;
          if (await showConfirmDialog(cardData)) {
            try {
              await deleteCard(cardData.id);
              newCard.remove();
              showToast(`${cardData.name} was released successfully!`);
            } catch (error) {
              console.error('Error deleting card:', error);
              showToast('Failed to release Pogemon', true);
            }
          }
        });
      } else {
        newCard.addEventListener('click', async (e) => {
          const palaceButton = e.target.closest('.palace-button');
          
          if (palaceButton) {
            e.stopPropagation(); // Prevent card load
            try {
              await showPalaceDialog(newCard.cardData);
            } catch (error) {
              console.error('Failed to send to PoGePalace:', error);
            }
            return;
          }

          loadCardToMain(newCard.cardData);
          viewer.classList.add('hidden');
        });
      }
      
      // Preserve the cardData
      newCard.cardData = card.cardData;
    });
  });

  exportBtn.addEventListener('click', async () => {
    try {
      const cards = await getAllCards();
      const exportData = {
        pogeflex: {
          version: 1,
          cards: cards,
          exported_at: new Date().toISOString()
        }
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pogeflex-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showToast('PoGeFlex collection exported successfully!');
    } catch (error) {
      console.error('Error exporting collection:', error);
      showToast('Failed to export collection', true);
    }
  });

  importBtn.addEventListener('click', () => {
    fileInput.click();
  });

  fileInput.addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      // Validate the imported data structure
      if (!data.pogeflex || !Array.isArray(data.pogeflex.cards)) {
        throw new Error('Invalid file format');
      }

      // Show import options dialog
      const importChoice = await showImportDialog(data.pogeflex.cards.length);
      if (importChoice === null) {
        fileInput.value = '';
        return; // User cancelled
      }

      // Get existing cards to check for duplicates
      const existingCards = await getAllCards();
      let cardsToImport;
      
      if (importChoice === 'skip') {
        // Filter out exact duplicates
        cardsToImport = data.pogeflex.cards.filter(importCard => 
          !existingCards.some(existingCard => 
            existingCard.name === importCard.name &&
            existingCard.description === importCard.description &&
            existingCard.imageUrl === importCard.imageUrl
          )
        );
      } else {
        // Import all cards
        cardsToImport = data.pogeflex.cards;
      }

      // Import the cards
      const importPromises = cardsToImport.map(card => saveCard(card));
      await Promise.all(importPromises);
      
      // Refresh the collection display
      const grid = viewer.querySelector('.collection-grid');
      grid.innerHTML = '';
      await showCollection();

      // Show success message
      const skippedCount = data.pogeflex.cards.length - cardsToImport.length;
      if (importChoice === 'skip' && skippedCount > 0) {
        showToast(`Imported ${cardsToImport.length} cards. Skipped ${skippedCount} duplicate(s).`);
      } else {
        showToast(`Successfully imported ${cardsToImport.length} cards!`);
      }
    } catch (error) {
      console.error('Error importing collection:', error);
      showToast('Failed to import collection: ' + error.message, true);
    }

    // Reset the file input
    fileInput.value = '';
  });

  return viewer;
}

export async function handleRegisterToFlex(palaceCardData) {
  // First check for duplicates
  const existingCards = await getAllCards();
  const isDuplicate = existingCards.some(card => 
    card.name === palaceCardData.name &&
    card.description === palaceCardData.description &&
    (card.imageUrl === palaceCardData.backupImageUrl || card.imageUrl === palaceCardData.imageUrl)
  );

  const dialog = document.createElement('div');
  dialog.className = 'confirm-dialog';
  dialog.innerHTML = `
    <h3>Register to PoGeFlex</h3>
    <p>Would you like to add ${palaceCardData.name} to your PoGeFlex collection?</p>
    ${isDuplicate ? `<p style="color: #ff5252; font-size: 0.9em; margin-top: 8px;">
      Note: You already have an exact copy of this Pogemon in your collection
    </p>` : ''}
    <div class="confirm-dialog-buttons">
      <button class="cancel">Cancel</button>
      <button class="confirm">
        Register
        <span class="loading-spinner hidden"></span>
      </button>
    </div>
  `;

  document.body.appendChild(dialog);

  try {
    const result = await new Promise((resolve) => {
      const cancelBtn = dialog.querySelector('.cancel');
      const confirmBtn = dialog.querySelector('.confirm');
      const spinner = dialog.querySelector('.loading-spinner');

      cancelBtn.addEventListener('click', () => {
        dialog.remove();
        resolve(false);
      });

      confirmBtn.addEventListener('click', async () => {
        try {
          // Show loading state
          confirmBtn.disabled = true;
          spinner.classList.remove('hidden');

          // Create a new card data object mapping palace data to flex format
          const flexCardData = {
            name: palaceCardData.name,
            description: palaceCardData.description,
            type: palaceCardData.pogetype,
            height: palaceCardData.height,
            weight: palaceCardData.weight,
            imageUrl: palaceCardData.backupImageUrl || palaceCardData.imageUrl,
            backupImageUrl: palaceCardData.backupImageUrl
          };

          // Save to local IndexDB
          await saveCard(flexCardData);
          
          dialog.remove();
          showToast(`${palaceCardData.name} was successfully registered to your PoGeFlex collection!${
            isDuplicate ? ' (Duplicate copy)' : ''
          }`);
          
          // Refresh the collection view if in palace view
          const viewer = document.querySelector('.collection-viewer');
          if (viewer && viewer.querySelector('h2').textContent.includes('PoGePalace')) {
            const palaceToggleBtn = viewer.querySelector('.palace-toggle-btn');
            if (palaceToggleBtn) {
              palaceToggleBtn.click(); // Switch to PoGeFlex view
              setTimeout(() => palaceToggleBtn.click(), 100); // Switch back to palace view
            }
          }
          
          resolve(true);
        } catch (error) {
          console.error('Failed to register to PoGeFlex:', error);
          showToast('Failed to register to PoGeFlex', true);
          confirmBtn.disabled = false;
          spinner.classList.add('hidden');
        }
      });
    });

    return result;
  } catch (error) {
    dialog.remove();
    throw error;
  }
}

export async function showImportDialog(totalCards) {
  return new Promise((resolve) => {
    const dialog = document.createElement('div');
    dialog.className = 'import-dialog';
    dialog.innerHTML = `
      <h3>Import Collection</h3>
      <p>About to import ${totalCards} cards.</p>
      <p>How would you like to handle potential duplicates?</p>
      <div class="import-options">
        <label>
          <input type="radio" name="duplicate-handling" value="skip" checked>
          Skip exact duplicates
        </label>
        <label>
          <input type="radio" name="duplicate-handling" value="allow">
          Allow all duplicates
        </label>
      </div>
      <div class="import-dialog-buttons">
        <button class="cancel">Cancel</button>
        <button class="confirm">Import</button>
      </div>
    `;

    document.body.appendChild(dialog);

    dialog.querySelector('.cancel').addEventListener('click', () => {
      dialog.remove();
      resolve(null);
    });

    dialog.querySelector('.confirm').addEventListener('click', () => {
      const selectedOption = dialog.querySelector('input[name="duplicate-handling"]:checked').value;
      dialog.remove();
      resolve(selectedOption);
    });
  });
}

export async function showConfirmDialog(cardData) {
  const dialog = document.createElement('div');
  dialog.className = 'confirm-dialog';
  dialog.innerHTML = `
    <h3>Release Pogemon</h3>
    <p>Are you sure you want to release ${cardData.name}?</p>
    <div class="confirm-dialog-buttons">
      <button class="cancel">Cancel</button>
      <button class="confirm">Release</button>
    </div>
  `;

  document.body.appendChild(dialog);

  const result = await new Promise((resolve) => {
    dialog.querySelector('.cancel').addEventListener('click', () => {
      dialog.remove();
      resolve(false);
    });

    dialog.querySelector('.confirm').addEventListener('click', async () => {
      dialog.remove();
      resolve(true);
    });
  });

  return result;
}

export async function showPalaceDialog(cardData) {
  const dialog = document.createElement('div');
  dialog.className = 'confirm-dialog palace-dialog';
  dialog.innerHTML = `
    <h3>Send to PoGePalace</h3>
    <p>Would you like to add ${cardData.name} to the PoGePalace?</p>
    <div class="confirm-dialog-buttons">
      <button class="cancel">Cancel</button>
      <button class="confirm">
        Send to Palace
        <span class="loading-spinner hidden"></span>
      </button>
    </div>
  `;

  document.body.appendChild(dialog);

  try {
    const result = await new Promise((resolve) => {
      const cancelBtn = dialog.querySelector('.cancel');
      const confirmBtn = dialog.querySelector('.confirm');
      const spinner = dialog.querySelector('.loading-spinner');

      cancelBtn.addEventListener('click', () => {
        dialog.remove();
        resolve(false);
      });

      confirmBtn.addEventListener('click', async () => {
        // Show loading state
        confirmBtn.disabled = true;
        spinner.classList.remove('hidden');

        try {
          await sendToPoGePalace(cardData);
          dialog.remove();
          showToast(`${cardData.name} was successfully added to PoGePalace!`);
          resolve(true);
        } catch (error) {
          console.error('Failed to send to PoGePalace:', error);
          showToast('Failed to send to PoGePalace', true);
          // Re-enable button and hide spinner on error
          confirmBtn.disabled = false;
          spinner.classList.add('hidden');
        }
      });
    });

    return result;
  } catch (error) {
    dialog.remove();
    throw error;
  }
}