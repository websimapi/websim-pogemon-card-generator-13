import { getPokemonDescription, generatePokemonImage } from './api.js';
import { saveCard } from './db.js';
import { handleHover, resetHover } from './components/card.js';
import { getTypeIcon, getTypeColor, showLoadingBar, hideLoadingBar } from './utils.js';

let lastGeneratedCard = null;

export async function generateCard() {
  showLoadingBar();
  try {
    // Remove existing card and submenu if any
    const existingCard = document.querySelector('.card');
    const existingSubmenu = document.querySelector('.submenu');
    if (existingCard) {
      existingCard.remove();
    }
    if (existingSubmenu) {
      existingSubmenu.remove();
    }

    // Create new card with front and back
    const cardContainer = document.getElementById('cardContainer');
    const card = document.createElement('div');
    card.className = 'card';
    
    // Create card inner structure with initial flipped state
    const cardInner = document.createElement('div');
    cardInner.className = 'card-inner flipped';
  
    cardInner.innerHTML = `
      <div class="card-front">
        <h2 class="pokemon-name"></h2>
        <div class="card-image-container"></div>
        <div class="stats-container">
          <div class="type-wrapper"></div>
          <p class="pokemon-stats"></p>
        </div>
        <div class="card-description">
          <p class="pokemon-description"></p>
        </div>
      </div>
      <div class="card-back">
        <div class="card-back-design">
          <svg class="card-back-logo" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" stroke-width="2"/>
            <circle cx="50" cy="50" r="20" fill="currentColor"/>
            <line x1="50" y1="5" x2="50" y2="95" stroke="currentColor" stroke-width="2"/>
          </svg>
          <div class="card-back-pattern"></div>
        </div>
      </div>
    `;
  
    card.appendChild(cardInner);
  
    // Create submenu but start hidden
    const submenu = document.createElement('div');
    submenu.className = 'submenu hidden';
  
    // Create submenu content with placeholder data
    submenu.innerHTML = `
      <div class="submenu-grid">
        <div class="stat-box">
          <div class="stat-label">Name</div>
          <div class="stat-value">???</div>
        </div>
        <div class="stat-box">
          <div class="stat-label">Type</div>
          <div class="stat-value">???</div>
        </div>
        <div class="stat-box">
          <div class="stat-label">Height</div>
          <div class="stat-value">???</div>
        </div>
        <div class="stat-box">
          <div class="stat-label">Weight</div>
          <div class="stat-value">???</div>
        </div>
      </div>
      <div class="description-box">
        <div class="description-title">Description</div>
        <div class="full-description">Generate a Pogemon to see its description!</div>
      </div>
    `;
  
    cardContainer.appendChild(submenu);

    // Get Pokemon description from LLM
    const pokemonData = await getPokemonDescription(lastGeneratedCard);

    // Update submenu content but keep it hidden
    const statValues = submenu.querySelectorAll('.stat-value');
    statValues[0].textContent = pokemonData.name;
    statValues[1].textContent = pokemonData.type;
    statValues[2].textContent = pokemonData.height;
    statValues[3].textContent = pokemonData.weight;
  
    submenu.querySelector('.full-description').textContent = pokemonData.description;

    // Store the new card data for next generation
    lastGeneratedCard = {
      name: pokemonData.name,
      type: pokemonData.type
    };

    // Generate image based on description
    const imageUrl = await generatePokemonImage(`cartoon Pogemon ${pokemonData.description}`);

    // Create card data object
    const cardData = {
      name: pokemonData.name,
      description: pokemonData.description,
      type: pokemonData.type,
      height: pokemonData.height,
      weight: pokemonData.weight,
      imageUrl: imageUrl
    };

    if (imageUrl) {
      try {
        // Fetch the image and create a File object
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const file = new File([blob], `${pokemonData.name}.png`, { type: 'image/png' });
      
        // Upload to websim storage and get backup URL
        const backupImageUrl = await websim.upload(file);
        cardData.backupImageUrl = backupImageUrl;

        // Create and display the image
        const pokemonImage = document.createElement('img');
        pokemonImage.id = `pokemon-${Date.now()}`;
        pokemonImage.className = 'pokemon-image';
        pokemonImage.src = imageUrl;
        pokemonImage.alt = `cartoon Pogemon ${pokemonData.description} - ${pokemonData.name} cartoon Pogemon`;
      
        const imageContainer = card.querySelector('.card-image-container');
        imageContainer.appendChild(pokemonImage);

        // Save the card with both URLs
        await saveCard(cardData);
      } catch (error) {
        console.error('Error handling image:', error);
        // If backup fails, still save the card with original URL
        await saveCard(cardData);
      }
    }

    // Create and append Pokemon info elements
    const nameElement = card.querySelector('.pokemon-name');
    nameElement.textContent = pokemonData.name;
  
    // Create stats container with new compact layout
    const statsContainer = card.querySelector('.stats-container');
  
    const types = pokemonData.type.split('/');
    const typeIcons = types.map(type => {
      const typeDiv = document.createElement('div');
      typeDiv.className = `type-icon ${type.toLowerCase().trim()}`;
      typeDiv.innerHTML = getTypeIcon(type.trim());
      typeDiv.title = type.trim();
      return typeDiv;
    });
  
    const typeWrapper = statsContainer.querySelector('.type-wrapper');
    typeIcons.forEach(icon => typeWrapper.appendChild(icon));

    // Add the gradient classes based on both types
    const primaryType = types[0].toLowerCase().trim();
    const secondaryType = types[1] ? types[1].toLowerCase().trim() : primaryType;
    const cardFront = card.querySelector('.card-front');
  
    // Remove any existing gradient classes
    cardFront.className = 'card-front';
  
    // Create custom gradient style
    const primaryColor = getTypeColor(primaryType);
    const secondaryColor = getTypeColor(secondaryType);
    cardFront.style.background = `linear-gradient(135deg, ${primaryColor}26, ${secondaryColor}26 70%)`;

    const statsElement = statsContainer.querySelector('.pokemon-stats');
    statsElement.textContent = `${pokemonData.height} | ${pokemonData.weight}`;
  
    const descElement = card.querySelector('.pokemon-description');
    descElement.textContent = pokemonData.description;
  
    cardContainer.appendChild(card);

    // Add click handler with submenu toggle
    card.addEventListener('click', (e) => {
      const cardInner = e.currentTarget.querySelector('.card-inner');
      cardInner.classList.toggle('flipped');
      
      // Show/hide submenu based on card flip state
      if (!cardInner.classList.contains('flipped')) {
        setTimeout(() => {
          submenu.classList.remove('hidden');
        }, 400); // Half the flip animation duration
      } else {
        submenu.classList.add('hidden');
      }
    });

    // Add hover effect
    card.addEventListener('mousemove', handleHover);
    card.addEventListener('mouseleave', resetHover);

    // Show card with initial animation
    requestAnimationFrame(() => {
      card.classList.add('show');
    });
  } catch(error) {
    console.error("Error generating card:", error);
  } finally {
    hideLoadingBar();
  }
}