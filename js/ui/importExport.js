import { getAllCards, saveCard } from '../db.js';
import { showToast } from '../utils.js';
import { showImportDialog } from './dialogs.js';
import { showCollection } from '../collection.js';

export function setupImportExport(viewer) {
  const exportBtn = viewer.querySelector('.export-btn');
  const importBtn = viewer.querySelector('.import-btn');
  const fileInput = viewer.querySelector('.hidden-file-input');

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
}