import { createMiniCard } from './components/miniCard.js';
import { showToast } from './utils.js';
import { getAllCards, saveCard, deleteCard } from './db.js';
import { loadCardToMain } from './components/card.js';
import { sendToPoGePalace } from './palace.js';
import { displayFilteredCards, showCollection } from './collection.js';

// Import new modular components
import { createCollectionViewer } from './ui/collectionViewer.js';
import { handleRegisterToFlex } from './ui/palaceIntegration.js';
import { showImportDialog, showConfirmDialog, showPalaceDialog } from './ui/dialogs.js';

let showingPalace = false;
export const isShowingPalace = () => showingPalace;
export const setShowingPalace = (value) => {
  showingPalace = value;
};

// Re-export functions that other modules depend on
export { createCollectionViewer, handleRegisterToFlex, showImportDialog, showConfirmDialog, showPalaceDialog };