import { generateCard } from './cardGenerator.js';
import { showCollection } from './collection.js';
import { setupPrintButton } from './print.js';
import { showLoadingBar, hideLoadingBar } from './utils.js';

export function setupEventListeners() {
  document.getElementById('generateBtn').addEventListener('click', generateCard);
  
  const initialCard = document.querySelector('.card');
  if (initialCard) {
    initialCard.addEventListener('click', async (e) => {
      // Prevent multiple clicks during locate
      if (initialCard.classList.contains('locating')) return;
      
      // Start locate animation
      initialCard.classList.add('locating');
      const generateBtn = document.getElementById('generateBtn');
      generateBtn.classList.add('locating');
      
      showLoadingBar();
      try {
        // Wait for card generation
        await generateCard();
        
        // After generation, flip the card
        const cardInner = document.querySelector('.card-inner');
        if (cardInner) {
          cardInner.classList.toggle('flipped');
        }
      } catch (error) {
        console.error('Error during initial card locate:', error);
      } finally {
        // Remove locate animation
        initialCard.classList.remove('locating');
        generateBtn.classList.remove('locating');
        hideLoadingBar();
      }
    });
  }
  
  setupPrintButton();

  // Add collection button
  const collectionBtn = document.createElement('button');
  collectionBtn.className = 'collection-btn';
  collectionBtn.innerHTML = `
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 16l-4-4v-6h-4V4h-4v10H4v6h10v2h4zM6 10h12V4H6v6z"/>
    </svg>
  `;
  document.querySelector('.container').appendChild(collectionBtn);

  collectionBtn.addEventListener('click', showCollection);
}