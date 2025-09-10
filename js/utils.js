export function showToast(message, isError = false) {
  const toast = document.createElement('div');
  toast.className = `toast ${isError ? 'error' : 'success'}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  // Trigger animation
  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  // Remove after animation
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

export function showLoadingBar() {
  const loadingBar = document.getElementById('loading-bar');
  if (loadingBar) {
    loadingBar.classList.add('show');
  }
}

export function hideLoadingBar() {
  const loadingBar = document.getElementById('loading-bar');
  if (loadingBar) {
    loadingBar.classList.remove('show');
  }
}

export function getTypeIcon(type) {
  const icons = {
    'Earth': `<svg viewBox="0 0 512 512">
      <path fill="currentColor" d="M256 32c-123.7 0-224 100.3-224 224s100.3 224 224 224 224-100.3 224-224S379.7 32 256 32zm120 80c16.8 0 32.6 3.8 46.8 10.6-16.5 14.9-36.5 28.4-59.2 39.9-2.3-7.2-4.9-14.3-7.8-21.3 7.5-9.5 14.3-19.3 20.2-29.2zM256 432c-97 0-176-79-176-176 0-40.3 13.6-77.3 36.4-107-5.6 12.6-10.4 25.7-14.4 39.3-2.8 9.5-5.2 19.2-7.2 29-6.8 33.7-8.1 68.5-3.9 102.9 4.5 37 14.7 72.7 30.2 106 19.4 41.5 45.8 79.5 78.1 112.3 7.5 7.6 15.3 14.9 23.4 21.9 10.8 9.3 22.1 18 33.9 26-40.8-32.3-71-79.4-81.6-133.6-5.8-29.4-5.3-59.3 1.2-88.4 2.1-9.5 4.9-18.9 8.3-28 12.4-33.1 32.8-63.3 59.7-88.7 5 19.8 12.6 39 22.7 57.1-35.9 28.1-58.8 71.5-58.8 120.1 0 84.8 69.2 154 154 154s154-69.2 154-154c0-84.8-69.2-154-154-154-30.3 0-58.5 8.7-82.2 23.8-3.8-7.7-7.2-15.5-10.3-23.5 27.9-17.7 60.9-27.9 96.1-27.9 97 0 160 71.6 160 160s-71.6 160-160 160-160-71.6-160-160S344.4 64 256 64z"/>
    </svg>`,
    
    'Air': `<svg viewBox="0 0 512 512">
      <path fill="currentColor" d="M256 96l-96 96v128l96 96 96-96V192l-96-96zm0 288l-64-64V192l64-64 64 64v128l-64 64zm32-160c0 17.7-14.3 32-32 32s-32-14.3-32-32 14.3-32 32-32 32 14.3 32 32z"/>
    </svg>`,
    
    'Sound': `<svg viewBox="0 0 512 512">
      <path fill="currentColor" d="M256 96l-96 96v128l96 96 96-96V192l-96-96zm0 288l-64-64V192l64-64 64 64v128l-64 64zm32-160c0 17.7-14.3 32-32 32s-32-14.3-32-32 14.3-32 32-32 32 14.3 32 32z"/>
    </svg>`,
    
    'Nature': `<svg viewBox="0 0 512 512">
      <path fill="currentColor" d="M256 96l-96 96v128l96 96 96-96V192l-96-96zm0 288l-64-64V192l64-64 64 64v128l-64 64zm32-160c0 17.7-14.3 32-32 32s-32-14.3-32-32 14.3-32 32-32 32 14.3 32 32z"/>
    </svg>`,
    
    'Fire': `<svg viewBox="0 0 512 512"><path fill="currentColor" d="M328.7 256c-18.7-18.7-49.1-18.7-67.9 0L256 388.7 149.1 281.9c-18.7-18.7-49.1-18.7-67.9 0-18.7 18.7-18.7 49.1 0 67.9l140.5 140.5c9.4 9.4 24.6 9.4 33.9 0l140.5-140.5c18.8 18.8 18.8 49.2 0 67.9-18.8 18.8-49.2 18.8-67.9 0l-140.5-140.5c-9.4-9.4-9.4-24.6 0-33.9L298.1 294.8c18.7 18.7 49.1 18.7 67.9 0 18.7-18.7 18.7-49.1 0-67.9L256 191.3 91.4 129.4c-9.4-9.4-9.4-24.6 0-33.9l140.5-140.5c9.4-9.4 24.6-9.4 33.9 0z"/></svg>`,
    
    'Water': `<svg viewBox="0 0 512 512"><path fill="currentColor" d="M256 96c-41.7 0-96 94.1-96 192 0 53 43 96 96 96s96-43 96-96c0-97.9-54.3-192-96-192zm0 256c-35.3 0-64-28.7-64-64s28.7-64 64-64 64 28.7 64 64-64 28.7 64 64z"/></svg>`,
    
    'Grass': `<svg viewBox="0 0 512 512"><path fill="currentColor" d="M256 96l-96 96v128l96 96 96-96V192l-96-96zm0 288l-64-64V192l64-64 64 64v128l-64 64zm32-160c0 17.7-14.3 32-32 32s-32-14.3-32-32 14.3-32 32-32 32 14.3 32 32z"/></svg>`,
    
    'Electric': `<svg viewBox="0 0 512 512"><path fill="currentColor" d="M296 160L256 32l-40 128h-88l72 88-40 168 136-120 40-168h-80zm0 168l-40 88 72-88-32-56 32-56-72-88 40 88 32 56-32 56z"/></svg>`,
    
    'Ice': `<svg viewBox="0 0 512 512"><path fill="currentColor" d="M384 256H128l128-224 128 224zm-256 0l128 224 128-224H128zm256-32l-128-224L128 224h256z"/></svg>`,
    
    'Fighting': `<svg viewBox="0 0 512 512"><path fill="currentColor" d="M256 64c-88.4 0-160 71.6-160 160s71.6 160 160 160 160-71.6 160-160S344.4 64 256 64zm80 160c0 44.2-35.8 80-80 80s-80-35.8-80-80 35.8-80 80-80 80 35.8 80 80zm-160 0c0 44.2-35.8 80-80 80s-80-35.8-80-80 35.8-80 80-80 80 35.8 80 80z"/></svg>`,
    
    'Poison': `<svg viewBox="0 0 512 512"><path fill="currentColor" d="M256 96l-96 96v128l96 96 96-96V192l-96-96zm0 288l-64-64V192l64-64 64 64v128l-64 64zm32-160c0 17.7-14.3 32-32 32s-32-14.3-32-32 14.3-32 32-32 32 14.3 32 32z"/></svg>`,
    
    'Ground': `<svg viewBox="0 0 512 512"><path fill="currentColor" d="M384 256H128l128-224 128 224zm-256 0l128 224 128-224H128zm256-32l-128-224L128 224h256z"/></svg>`,
    
    'Flying': `<svg viewBox="0 0 512 512"><path fill="currentColor" d="M256 32L128 160l128 128 128-128L256 32zm0 384l-96 96 96 96 96-96L256 32zm0-256l-64 64-64 64 64 64 64-64z"/></svg>`,
    
    'Psychic': `<svg viewBox="0 0 512 512"><path fill="currentColor" d="M256 96c-88.4 0-160 71.6-160 160s71.6 160 160 160 160-71.6 160-160S344.4 96 256 96zm0 256c-53 0-96-43-96-96s43-96 96-96 96 43 96 96-43 96-96 96zm48-96c0 26.5-21.5 48-48 48s-48-21.5-48-48 21.5-48 48-48 48 21.5 48 48z"/></svg>`,
    
    'Bug': `<svg viewBox="0 0 512 512"><path fill="currentColor" d="M256 64c-88.4 0-160 71.6-160 160s71.6 160 160 160 160-71.6 160-160S344.4 64 256 64zm80 160c0 44.2-35.8 80-80 80s-80-35.8-80-80 35.8-80 80-80 80 35.8 80 80zm-160 0c0 44.2-35.8 80-80 80s-80-35.8-80-80 35.8-80 80-80 80 35.8 80 80z"/></svg>`,
    
    'Rock': `<svg viewBox="0 0 512 512"><path fill="currentColor" d="M256 96l-96 96v128l96 96 96-96V192l-96-96zm0 288l-64-64V192l64-64 64 64v128l-64 64zm32-160c0 17.7-14.3 32-32 32s-32-14.3-32-32 14.3-32 32-32 32 14.3 32 32z"/></svg>`,
    
    'Ghost': `<svg viewBox="0 0 512 512"><path fill="currentColor" d="M256 64c-88.4 0-160 71.6-160 160s71.6 160 160 160 160-71.6 160-160S344.4 64 256 64zm80 160c0 44.2-35.8 80-80 80s-80-35.8-80-80 35.8-80 80-80 80 35.8 80 80zm-160 0c0 44.2-35.8 80-80 80s-80-35.8-80-80 35.8-80 80-80 80 35.8 80 80z"/></svg>`,
    
    'Dragon': `<svg viewBox="0 0 512 512"><path fill="currentColor" d="M256 32L128 160l128 128 128-128L256 32zm0 384l-96 96 96 96 96-96L256 32zm0-256l-64 64-64 64 64 64 64-64z"/></svg>`,
    
    'Dark': `<svg viewBox="0 0 512 512"><path fill="currentColor" d="M256 96c-88.4 0-160 71.6-160 160s71.6 160 160 160 160-71.6 160-160S344.4 96 256 96zm0 256c-53 0-96-43-96-96s43-96 96-96 96 43 96 96-43 96-96 96zm48-96c0 26.5-21.5 48-48 48s-48-21.5-48-48 21.5-48 48-48 48 21.5 48 48z"/></svg>`,
    
    'Steel': `<svg viewBox="0 0 512 512"><path fill="currentColor" d="M256 64c-88.4 0-160 71.6-160 160s71.6 160 160 160 160-71.6 160-160S344.4 64 256 64zm80 160c0 44.2-35.8 80-80 80s-80-35.8-80-80 35.8-80 80-80 80 35.8 80 80zm-160 0c0 44.2-35.8 80-80 80s-80-35.8-80-80 35.8-80 80-80 80 35.8 80 80z"/></svg>`,
    
    'Fairy': `<svg viewBox="0 0 512 512"><path fill="currentColor" d="M256 64l64 64-64 64-64-64 64-64zm0 384l64-64-64-64-64 64 64 64zm0-192l64 64-64 64-64-64 64-64zm-128-64l64 64-64 64-64-64 64-64zm256 0l64 64-64 64-64-64 64-64z"/></svg>`,
    'Plant': `<svg viewBox="0 0 512 512">
      <defs>
        <linearGradient id="leafGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#4CAF50;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#388E3C;stop-opacity:1" />
        </linearGradient>
      </defs>
      <g fill="currentColor">
        <path d="M256 48c-12.2 0-24 2.4-35 6.7C258.2 76.8 280 113.7 280 156c0 57.9-47.1 105-105 105-42.3 0-79.2-21.8-101.3-59C69.4 232 67 243.8 67 256c0 104.4 84.6 189 189 189s189-84.6 189-189S360.4 48 256 48z"/>
        <path d="M175 156c0-31.8 11.8-61.2 31.5-84.7C152.3 75.3 112 118.3 112 170c0 28.9 11.7 55.1 30.6 74.1 21-17.6 32.4-43.8 32.4-72.1 0-5.4-.3-10.7-1-15.9"/>
        <path d="M280 156c0 31.8-11.8 61.2-31.5 84.7C302.7 236.7 343 193.7 343 142c0-28.9-11.7-55.1-30.6-74.1-21 17.6-32.4 43.8-32.4 72.1 0 5.4.3 10.7 1 15.9"/>
      </g>
      <circle cx="256" cy="256" r="25" fill="#81C784"/>
      <path d="M256 220c-19.9 0-36 16.1-36 36s16.1 36 36 36 36-16.1 36-36-16.1-36-36-36zm0 52c-8.8 0-16-7.2-16-16s7.2-16 16-16 16 7.2 16 16z"/>
    </svg>`,
    
    'Sky': `<svg viewBox="0 0 512 512">
      <path fill="currentColor" d="M412 160c-7.7 0-14 6.3-14 14s6.3 14 14 14 14-6.3 14-14-6.3-14-14-14zm-312 0c7.7 0 14 6.3 14 14s-6.3 14-14 14-14-6.3-14-14 6.3-14 14-14zm156 0c-30.9 0-56 25.1-56 56s25.1 56 56 56 56-25.1 56-56-25.1-56-56-56z"/>
      <path fill="currentColor" d="M256 32C132.3 32 32 132.3 32 256s100.3 224 224 224 224-100.3 224-224S379.7 32 256 32zm0 400c-97.9 0-176-78.1-176-176 0-97.9 78.1-176 176-176 97.9 0 176 78.1 176 176z"/>
    </svg>`,
    
    'Flora': `<svg viewBox="0 0 512 512">
      <path fill="currentColor" d="M64 96c0-35.3 28.7-64 64-64h256c35.3 0 64 28.7 64 64v320c0 35.3-28.7 64-64 64H128c-35.3 0-64-28.7-64-64V96zm128 64c0 17.7 14.3 32 32 32h64c17.7 0 32-14.3 32-32s-14.3-32-32-32h-64c-17.7 0-32 14.3-32 32zm128 128c0 17.7 14.3 32 32 32h64c17.7 0 32-14.3 32-32s-14.3-32-32-32h-64c-17.7 0-32 14.3-32 32zm-128 128c0 17.7 14.3 32 32 32h64c17.7 0 32-14.3 32-32s-14.3-32-32-32h-64c-17.7 0-32 14.3-32 32z"/>
      <path fill="currentColor" d="M320 160c-17.7 0-32 14.3-32 32s14.3 32 32 32 32-14.3 32-32-14.3-32-32-32zm-208 0c17.7 0 32 14.3 32 32s-14.3 32-32 32-32-14.3-32-32 14.3-32 32-32z"/>
    </svg>`,
    
    'Elemental': `<svg viewBox="0 0 512 512">
      <path fill="currentColor" d="M256 32l-96 96v128l96 96 96-96V192l-96-96zm0 288l-64-64V192l64-64 64 64v128l-64 64zm32-160c0 17.7-14.3 32-32 32s-32-14.3-32-32 14.3-32 32-32 32 14.3 32 32z"/>
      <path fill="currentColor" d="M192 192l64-64 64 64-64 64-64-64zm32 0c0 17.7-14.3 32-32 32s-32-14.3-32-32 14.3-32 32-32 32 14.3 32 32z"/>
      <circle cx="256" cy="256" r="24" fill="currentColor"/>
      <circle cx="256" cy="192" r="16" fill="currentColor"/>
      <circle cx="256" cy="320" r="16" fill="currentColor"/>
      <circle cx="192" cy="256" r="16" fill="currentColor"/>
      <circle cx="320" cy="256" r="16" fill="currentColor"/>
    </svg>`,
    'Celestial': `<svg viewBox="0 0 512 512">
      <defs>
        <radialGradient id="starGlow" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
          <stop offset="0%" style="stop-color:#FFD700;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#4A90E2;stop-opacity:0" />
        </radialGradient>
      </defs>
      <g fill="currentColor">
        <path d="M256 48c-110.28 0-200 89.72-200 200s89.72 200 200 200 200-89.72 200-200S366.28 48 256 48zm0 360c-88.37 0-160-71.63-160-160S167.63 88 256 88s160 71.63 160 160-71.63 160-160 160z"/>
        <circle cx="256" cy="248" r="32"/>
        <circle cx="156" cy="248" r="16"/>
        <circle cx="356" cy="248" r="16"/>
        <circle cx="256" cy="148" r="16"/>
        <circle cx="256" cy="348" r="16"/>
        <path d="M256 208l24 24-24 24-24-24z"/>
      </g>
      <circle cx="256" cy="248" r="120" fill="none" stroke="currentColor" stroke-width="8" stroke-dasharray="16 8" opacity="0.3"/>
    </svg>`,
    'Light': `<svg viewBox="0 0 512 512">
      <defs>
        <radialGradient id="lightGlow" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
          <stop offset="0%" style="stop-color:#FFD700;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#FFF;stop-opacity:0" />
        </radialGradient>
      </defs>
      <g fill="currentColor">
        <circle cx="256" cy="256" r="64"/>
        <g>
          <path d="M256 160v-64M256 416v-64M160 256H96M416 256h-64M184 184l-45-45M373 373l-45-45M184 328l-45 45M373 139l-45 45" 
            stroke="currentColor" stroke-width="32" stroke-linecap="round"/>
        </g>
        <circle cx="256" cy="256" r="96" fill="none" stroke="currentColor" stroke-width="16" opacity="0.3"/>
      </g>
    </svg>`,
    'Cosmic': `<svg viewBox="0 0 512 512">
      <defs>
        <radialGradient id="cosmicGlow" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
          <stop offset="0%" style="stop-color:#B388FF;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#7C4DFF;stop-opacity:0" />
        </radialGradient>
      </defs>
      <g fill="currentColor">
        <path d="M256 48c-110.28 0-200 89.72-200 200s89.72 200 200 200 200-89.72 200-200S366.28 48 256 48zm0 360c-88.37 0-160-71.63-160-160S167.63 88 256 88s160 71.63 160 160-71.63 160-160 160z"/>
        <circle cx="256" cy="256" r="32"/>
        <path d="M256 96l32 32-32 32-32-32z"/>
        <path d="M256 352l32 32-32 32-32-32z"/>
        <path d="M96 256l32 32-32 32-32-32z"/>
        <path d="M416 256l32 32-32 32-32-32z"/>
        <circle cx="176" cy="176" r="16"/>
        <circle cx="336" cy="176" r="16"/>
        <circle cx="176" cy="336" r="16"/>
        <circle cx="336" cy="336" r="16"/>
      </g>
      <circle cx="256" cy="256" r="150" fill="none" stroke="currentColor" stroke-width="4" stroke-dasharray="16 8" opacity="0.3"/>
    </svg>`,
  };
  
  return icons[type] || `<svg viewBox="0 0 512 512"><path fill="currentColor" d="M256 96c-88.4 0-160 71.6-160 160s71.6 160 160 160 160-71.6 160-160S344.4 96 256 96z"/></svg>`;
}

export function getTypeColor(type) {
  const colors = {
    'air': '#B4D4E4',
    'sound': '#9B6B9E', 
    'nature': '#5A9E54',
    'fire': '#FF4422',
    'water': '#3399FF',
    'grass': '#77CC55',
    'electric': '#FFCC33',
    'ice': '#66CCFF',
    'fighting': '#BB5544',
    'poison': '#AA5599',
    'ground': '#DDBB55',
    'flying': '#8899FF',
    'psychic': '#FF5599',
    'bug': '#AABB22',
    'rock': '#BBAA66',
    'ghost': '#6666BB',
    'dragon': '#7766EE',
    'dark': '#775544',
    'steel': '#AAAABB',
    'fairy': '#EE99EE',
    'plant': '#4CAF50',
    'sky': '#87CEEB',  // Sky blue
    'flora': '#98FB98', // Pale green
    'elemental': '#DDA0DD', // Plum
    'celestial': '#4B0082', // Deep indigo color for celestial type
    'light': '#FFD700', // Bright golden yellow for light type
    'cosmic': '#7C4DFF', // Deep purple color for cosmic type
  };
  
  return colors[type.toLowerCase()] || '#999999';
}