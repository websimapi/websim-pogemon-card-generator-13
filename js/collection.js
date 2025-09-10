import { createMiniCard } from './components/miniCard.js';
import { createCollectionViewer, isShowingPalace, setShowingPalace } from './ui.js';
import { getTypeIcon } from './utils.js';
import { getAllCards } from './db.js';

let pogepalace = new WebsimSocket();

export function displayFilteredCards(cards, selectedTypes, filterMode, isPalaceView = false) {
  const grid = document.querySelector('.collection-grid');
  if (!grid) return;
  
  grid.innerHTML = '';
  
  let filteredCards;
  
  if (selectedTypes.length === 0 || (selectedTypes.length === 1 && selectedTypes[0] === 'all')) {
    filteredCards = cards;
  } else if (filterMode === 'and') {
    filteredCards = cards.filter(card => 
      selectedTypes.every(type => 
        (card.pogetype || card.type) 
        .split('/')
        .map(t => t.trim())
        .includes(type)
      )
    );
  } else { // 'single' or 'or'
    filteredCards = cards.filter(card => 
      selectedTypes.some(type => 
        (card.pogetype || card.type) 
        .split('/')
        .map(t => t.trim())
        .includes(type)
      )
    );
  }
  
  if (filteredCards.length === 0) {
    grid.innerHTML = `
      <div class="no-cards-message">
        No Pogemons found matching the selected filters
      </div>
    `;
    return;
  }
  
  filteredCards.forEach(card => {
    if (isPalaceView) {
      const pogeCardData = {
        ...card,
        type: card.pogetype, 
        id: card.id,
        imageUrl: card.backupImageUrl || card.imageUrl
      };
      const miniCard = createMiniCard(pogeCardData, isPalaceView);
      grid.appendChild(miniCard);
    } else {
      const miniCard = createMiniCard(card, isPalaceView);
      grid.appendChild(miniCard);
    }
  });
}

export function generateTypeTabs(cards, tabsContainer, isShowingPalace, callback) {
  const allTypes = new Set();
  cards.forEach(card => {
    const typeString = isShowingPalace ? card.pogetype : card.type;
    typeString.split('/').forEach(type => {
      allTypes.add(type.trim());
    });
  });
  
  tabsContainer.innerHTML = `
    <button class="type-tab" data-type="all">
      <span>ALL</span>
    </button>
    ${Array.from(allTypes).sort().map(type => `
      <button class="type-tab" data-type="${type}">
        <div class="type-icon ${type.toLowerCase()}">${getTypeIcon(type)}</div>
        <span>${type}</span>
      </button>
    `).join('')}
  `;

  let selectedTypes = new Set();
  let filterMode = 'single'; 
  
  const tabs = tabsContainer.querySelectorAll('.type-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', async (e) => {
      const type = tab.dataset.type;
      
      if (e.ctrlKey || e.metaKey) {
        if (filterMode !== 'and') {
          selectedTypes.clear(); 
          filterMode = 'and';
        }
        
        if (selectedTypes.has(type)) {
          selectedTypes.delete(type);
        } else if (selectedTypes.size < 2) {
          selectedTypes.add(type);
        }
        
      } else if (e.shiftKey) {
        filterMode = 'or';
        if (selectedTypes.has(type)) {
          selectedTypes.delete(type);
        } else {
          selectedTypes.add(type);
        }
        
      } else {
        filterMode = 'single';
        selectedTypes.clear();
        selectedTypes.add(type);
      }

      tabs.forEach(t => {
        t.classList.remove('selected-single', 'selected-or', 'selected-and');
        if (selectedTypes.has(t.dataset.type)) {
          t.classList.add(`selected-${filterMode}`);
        }
      });
      
      if (type === 'all' && filterMode === 'single') {
        selectedTypes.clear();
      }
      
      // Call the callback with the current filter state
      callback(Array.from(selectedTypes), filterMode);
    });
  });
}

export async function showCollection() {
  let viewer = document.querySelector('.collection-viewer');
  
  if (!viewer) {
    // Pass showingPalace state and setter to the viewer creator
    const showingPalaceState = { current: isShowingPalace() };
    const setter = (val) => {
      setShowingPalace(val);
      showingPalaceState.current = val;
    };
    viewer = await createCollectionViewer(showingPalaceState, setter);
  }
  
  const grid = viewer.querySelector('.collection-grid');
  const tabsContainer = viewer.querySelector('.collection-tabs');
  
  if (!grid || !tabsContainer) {
    console.error('Required collection elements not found');
    return;
  }

  try {
    const isShowingPalace = viewer.querySelector('h2').textContent.includes('PoGePalace');
    let cards;
    if (isShowingPalace) {
      cards = await pogepalace.collection('pogemon').getList();
    } else {
      cards = await getAllCards();
      cards.sort((a, b) => b.timestamp - a.timestamp);
    }
    
    // Generate type tabs with callback for filtering
    generateTypeTabs(cards, tabsContainer, isShowingPalace, async (selectedTypes, filterMode) => {
      let currentCards;
      
      if (isShowingPalace) {
        currentCards = await pogepalace.collection('pogemon').getList();
      } else {
        currentCards = await getAllCards();
        currentCards.sort((a, b) => b.timestamp - a.timestamp);
      }
      
      displayFilteredCards(currentCards, selectedTypes, filterMode, isShowingPalace);
    });
    
    displayFilteredCards(cards, [], 'single', isShowingPalace);
    
    viewer.classList.remove('hidden');
  } catch (error) {
    console.error('Error loading collection:', error);
  }
}