import { initDB } from './db.js';
import { setupEventListeners } from './eventHandlers.js';

document.addEventListener('DOMContentLoaded', () => {
  initDB();
  setupEventListeners();
});