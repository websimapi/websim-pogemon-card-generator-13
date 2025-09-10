import { getDB } from './db.js';

const pogepalace = new WebsimSocket();

export async function sendToPoGePalace(cardData) {
  try {
    // First fetch the image and convert it to a File object
    const response = await fetch(cardData.imageUrl);
    const blob = await response.blob();
    const file = new File([blob], `${cardData.name}.png`, { type: 'image/png' });
    
    // Upload image to websim storage
    const backupImageUrl = await websim.upload(file);
    
    // Update local IndexDB record with backup URL
    if (cardData.id) {
      const db = getDB(); // Get database reference
      const transaction = db.transaction(['cards'], 'readwrite');
      const store = transaction.objectStore('cards');
      const request = store.get(cardData.id);
      
      request.onsuccess = () => {
        const record = request.result;
        if (record) {
          record.backupImageUrl = backupImageUrl;
          store.put(record);
        }
      };
    }
    
    // Create a new record in the PoGePalace collection
    const pogeRecord = await pogepalace.collection('pogemon').create({
      name: cardData.name,
      description: cardData.description,
      pogetype: cardData.type, 
      height: cardData.height, 
      weight: cardData.weight,
      imageUrl: cardData.imageUrl,
      backupImageUrl: backupImageUrl,
      origin_trainer: pogepalace.party.client.username
    });
    
    // Log the newly created record
    console.log('New PoGePalace record created:', pogeRecord);

    // Get all records from PoGePalace and log them
    const allPogemons = await pogepalace.collection('pogemon').getList();
    console.log('Current PoGePalace collection:', allPogemons);

    // Subscribe to changes in the PoGePalace collection
    pogepalace.collection('pogemon').subscribe((pogemons) => {
      console.log('PoGePalace collection updated:', pogemons);
    });

    return pogeRecord;
  } catch (error) {
    console.error('Error sending to PoGePalace:', error);
    throw error;
  }
}