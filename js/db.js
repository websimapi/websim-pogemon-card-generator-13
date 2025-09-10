let db;

export const initDB = () => {
  const request = indexedDB.open('Pogeflex', 1);
  
  request.onerror = (event) => {
    console.error('Database error:', event.target.error);
  };

  request.onupgradeneeded = (event) => {
    db = event.target.result;
    if (!db.objectStoreNames.contains('cards')) {
      const store = db.createObjectStore('cards', { keyPath: 'id', autoIncrement: true });
      store.createIndex('name', 'name', { unique: false });
      store.createIndex('timestamp', 'timestamp', { unique: false });
    }
  };

  request.onsuccess = (event) => {
    db = event.target.result;
  };
};

export const saveCard = async (cardData) => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['cards'], 'readwrite');
    const store = transaction.objectStore('cards');
    
    const newCard = {
      name: cardData.name,
      description: cardData.description,
      type: cardData.type, 
      pogetype: cardData.type, 
      height: cardData.height,
      weight: cardData.weight,
      imageUrl: cardData.imageUrl,
      backupImageUrl: cardData.backupImageUrl,
      timestamp: new Date().getTime()
    };

    const request = store.add(newCard);

    request.onsuccess = () => {
      newCard.id = request.result;
      resolve(newCard);
    };
    request.onerror = () => reject(request.error);
  });
};

export const getAllCards = async () => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['cards'], 'readonly');
    const store = transaction.objectStore('cards');
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const deleteCard = async (id) => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['cards'], 'readwrite');
    const store = transaction.objectStore('cards');
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const getDB = () => db;