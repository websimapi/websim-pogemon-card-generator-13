import { getAllCards, deleteCard } from '../db.js';
import { showToast } from '../utils.js';
import { loadCardToMain } from '../components/card.js';
import { showConfirmDialog, showPalaceDialog } from './dialogs.js';
import { setupImportExport } from './importExport.js';
import { setupPalaceToggle, handleRegisterToFlex } from './palaceIntegration.js';
import { displayFilteredCards } from '../collection.js';

export async function createCollectionViewer(showingPalace, setShowingPalace) {
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

  // Setup close button
  setupCloseButton(viewer, showingPalace, setShowingPalace);
  
  // Setup delete mode toggle
  setupDeleteMode(viewer);
  
  // Setup import/export
  setupImportExport(viewer);
  
  // Setup palace toggle
  setupPalaceToggle(viewer, showingPalace, setShowingPalace);

  return viewer;
}

function setupCloseButton(viewer, showingPalace, setShowingPalace) {
  const closeBtn = viewer.querySelector('.close-collection');
  
  closeBtn.addEventListener('click', () => {
    viewer.classList.add('hidden');
    const deleteToggle = viewer.querySelector('.delete-mode-toggle');
    deleteToggle.classList.remove('active');
    const cards = viewer.querySelectorAll('.mini-card');
    cards.forEach(card => card.classList.remove('delete-mode'));
    
    // Reset to PoGeFlex view for next open
    if (showingPalace.current) {
      setShowingPalace(false);
      const palaceToggleBtn = viewer.querySelector('.palace-toggle-btn');
      palaceToggleBtn.classList.remove('active');
      const title = viewer.querySelector('h2');
      title.textContent = 'Your PoGeFlex Collection';
      const deleteToggle = viewer.querySelector('.delete-mode-toggle');
      const importBtn = viewer.querySelector('.import-btn');
      const exportBtn = viewer.querySelector('.export-btn');
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
}

function setupDeleteMode(viewer) {
  const deleteToggle = viewer.querySelector('.delete-mode-toggle');
  let deleteMode = false;

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
}