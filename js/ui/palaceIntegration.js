import { getAllCards, saveCard } from '../db.js';
import { showToast } from '../utils.js';
import { displayFilteredCards, generateTypeTabs } from '../collection.js';

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

export function setupPalaceToggle(viewer, showingPalace, setShowingPalace) {
  const palaceToggleBtn = viewer.querySelector('.palace-toggle-btn');
  
  palaceToggleBtn.addEventListener('click', async () => {
    const newShowingPalace = !showingPalace.current;
    setShowingPalace(newShowingPalace);
    palaceToggleBtn.classList.toggle('active');
    
    // Update button title and icons
    const palaceIcon = palaceToggleBtn.querySelector('.palace-view-icon');
    const flexIcon = palaceToggleBtn.querySelector('.flex-view-icon');
    
    if (newShowingPalace) {
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
    const tabsContainer = viewer.querySelector('.collection-tabs');
    const deleteToggle = viewer.querySelector('.delete-mode-toggle');
    const importBtn = viewer.querySelector('.import-btn');
    const exportBtn = viewer.querySelector('.export-btn');
    
    grid.innerHTML = '';

    if (newShowingPalace) {
      title.textContent = 'PoGePalace Collection';
      deleteToggle.style.display = 'none'; // Hide delete toggle in palace view
      importBtn.style.display = 'none';
      exportBtn.style.display = 'none';
      
      try {
        const pogepalace = new WebsimSocket();
        const pogemons = await pogepalace.collection('pogemon').getList();
        
        // Generate type tabs for palace view
        generateTypeTabs(pogemons, tabsContainer, true, async (selectedTypes, filterMode) => {
          const currentPogemons = await pogepalace.collection('pogemon').getList();
          displayFilteredCards(currentPogemons, selectedTypes, filterMode, true);
        });
        
        displayFilteredCards(pogemons, [], 'single', true); // Pass true for isPalaceView

        // Subscribe to real-time updates
        pogepalace.collection('pogemon').subscribe((updatedPogemons) => {
          if (showingPalace.current) { // Only update if still showing palace
            // Regenerate tabs when data changes
            generateTypeTabs(updatedPogemons, tabsContainer, true, async (selectedTypes, filterMode) => {
              const currentPogemons = await pogepalace.collection('pogemon').getList();
              displayFilteredCards(currentPogemons, selectedTypes, filterMode, true);
            });
            displayFilteredCards(updatedPogemons, [], 'single', true);
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
      
      // Generate type tabs for flex view
      generateTypeTabs(cards, tabsContainer, false, async (selectedTypes, filterMode) => {
        const currentCards = await getAllCards();
        currentCards.sort((a, b) => b.timestamp - a.timestamp);
        displayFilteredCards(currentCards, selectedTypes, filterMode, false);
      });
      
      displayFilteredCards(cards, [], 'single');
    }
  });
}