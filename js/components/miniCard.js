import { showPalaceDialog, handleRegisterToFlex, setShowingPalace } from '../ui.js';
import { loadCardToMain } from './card.js';
import { getTypeIcon, getTypeColor } from '../utils.js';

export function createMiniCard(cardData, isPalaceView = false) {
  const miniCard = document.createElement('div');
  miniCard.className = 'mini-card';
  miniCard.dataset.cardId = cardData.id;
  miniCard.cardData = cardData;
  
  const types = cardData.type ? cardData.type.split('/') : cardData.pogetype.split('/');
  const primaryType = types[0].toLowerCase().trim();
  const secondaryType = types[1] ? types[1].toLowerCase().trim() : primaryType;
  const primaryColor = getTypeColor(primaryType);
  const secondaryColor = getTypeColor(secondaryType);
  
  // Different icons for Palace vs Flex
  const buttonIcon = isPalaceView ? `
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 6h18V4H4c-1.1 0-2 .9-2 2v11H0v3h14v-3H4V6zm19 2h-6c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h6c.55 0 1-.45 1-1V9c0-.55-.45-1-1-1zm-1 9h-4v-7h4v7z"/>
    </svg>
  ` : `
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3zm3 13v3h-2v-3h2z"/>
    </svg>
  `;
  
  miniCard.innerHTML = `
    <div class="mini-card-inner" style="background: linear-gradient(135deg, ${primaryColor}26, ${secondaryColor}26 70%)">
      <div class="delete-overlay">
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 4h-3.5l-1-1h-5l-1 1H5v2h14M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12z"/>
        </svg>
      </div>
      <div class="palace-button" title="${isPalaceView ? 'Register to PoGeFlex' : 'Send to PoGePalace'}">
        ${buttonIcon}
      </div>
      <h3 class="mini-card-name">${cardData.name}</h3>
      <div class="mini-card-stats">
        <div class="mini-card-type">
          ${types.map(type => `
            <div class="type-icon ${type.toLowerCase().trim()}" title="${type.trim()}">
              ${getTypeIcon(type.trim())}
            </div>
          `).join('')}
        </div>
        <span class="mini-card-stats-text">${cardData.height} | ${cardData.weight}</span>
      </div>
      <div class="mini-card-image" style="background-image: url('${cardData.backupImageUrl || cardData.imageUrl}')"></div>
      <div class="mini-card-description">${cardData.description}</div>
    </div>
  `;

  miniCard.addEventListener('click', async (e) => {
    const palaceButton = e.target.closest('.palace-button');
    
    if (palaceButton) {
      e.stopPropagation(); // Prevent card load
      try {
        if (isPalaceView) {
          await handleRegisterToFlex(miniCard.cardData);
        } else {
          await showPalaceDialog(miniCard.cardData);
        }
      } catch (error) {
        console.error('Failed to handle palace action:', error);
      }
      return;
    }

    // Regular card click behavior
    if (!e.target.closest('.delete-overlay')) {
      // Reset palace state when viewing a card
      setShowingPalace(false); 
      
      // Load the card
      loadCardToMain(miniCard.cardData);
      
      // Hide collection viewer
      const viewer = document.querySelector('.collection-viewer');
      if (viewer) {
        // Reset UI elements
        const palaceToggleBtn = viewer.querySelector('.palace-toggle-btn');
        if (palaceToggleBtn) {
          palaceToggleBtn.classList.remove('active');
        }
        
        const deleteToggle = viewer.querySelector('.delete-mode-toggle');
        const importBtn = viewer.querySelector('.import-btn');
        const exportBtn = viewer.querySelector('.export-btn');
        
        if (deleteToggle) deleteToggle.style.display = '';
        if (importBtn) importBtn.style.display = '';
        if (exportBtn) exportBtn.style.display = '';
        
        // Update title
        const title = viewer.querySelector('h2');
        if (title) {
          title.textContent = 'Your PoGeFlex Collection';
        }
        
        // Hide viewer
        viewer.classList.add('hidden');
      }
    }
  });

  return miniCard;
}