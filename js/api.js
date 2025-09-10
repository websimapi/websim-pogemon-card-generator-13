export async function getRandomCardFromIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('Pogeflex', 1);
    
    request.onerror = () => reject(request.error);
    
    request.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction(['cards'], 'readonly');
      const store = transaction.objectStore('cards');
      const request = store.count();
      
      request.onsuccess = () => {
        const count = request.result;
        if (count === 0) {
          resolve(null);
          return;
        }
        
        // Get a random index
        const randomIndex = Math.floor(Math.random() * count);
        
        // Get all cards and pick one randomly
        const getAllRequest = store.getAll();
        getAllRequest.onsuccess = () => {
          const randomCard = getAllRequest.result[randomIndex];
          resolve(randomCard);
        };
        getAllRequest.onerror = () => reject(getAllRequest.error);
      };
      
      request.onerror = () => reject(request.error);
    };
  });
}

export async function getPokemonDescription(lastCard = null) {
  try {
    // Get a random card from IndexedDB
    const randomExistingCard = await getRandomCardFromIndexedDB();
    
    // Generate a random seed between 1 and 1000000
    const randomSeed = Math.floor(Math.random() * 1000000) + 1;
    
    const completion = await websim.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `Generate a creative description for a completely new, unique Pogemon. The name should be original and meaningful, derived from a combination of Latin, Greek, or English root words that relate to the Pogemon's characteristics. For example:
          - "Sylphoon" (from sylph: air spirit + typhoon)
          - "Luminox" (from lumino: light + nox: night)
          - "Dendrovern" (from dendro: tree + vernal: spring)
          
          Be imaginative and original - do not reuse existing Pogemons. Include its type, height, weight, and a brief poetic description of its appearance and behavior. The description should capture the whimsical and magical nature of the Pogemon world. Each response should be different from previous ones.
          
          Random seed for inspiration: ${randomSeed}
          
          ${lastCard ? `
          The last generated Pogemon was:
          Name: ${lastCard.name}
          Type: ${lastCard.type}
          
          Please ensure this generation is different from the previous one in both name theme and type.` : ''}
          
          ${randomExistingCard ? `
          A random Pogemon from the user's collection:
          Name: ${randomExistingCard.name}
          Type: ${randomExistingCard.type}
          Description: ${randomExistingCard.description}
          
          Please ensure this generation is unique and different from both the previous and this random card.` : ''}

          Respond directly with JSON, following this JSON schema, and no other text:
          {
            name: string;
            description: string; 
            type: string;
            height: string;
            weight: string;
          }

          Example response (generate something completely different):
          {
            "name": "Pyroxian",
            "description": "A mystical fire-psychic Pogemon whose crystalline body channels volcanic energies into mesmerizing displays of mental prowess. Its presence warms the mind as much as the air around it.",
            "type": "Fire/Psychic",
            "height": "1.8m",
            "weight": "45kg"
          }`
        }
      ],
      json: true
    });

    return JSON.parse(completion.content);
  } catch (error) {
    console.error('Error fetching Pogemon description:', error);
    return {
      name: 'Error',
      description: 'Failed to generate Pogemon description',
      type: 'Unknown',
      height: 'Unknown',
      weight: 'Unknown'
    };
  }
}

export async function generatePokemonImage(description) {
  try {
    const result = await websim.imageGen({
      prompt: description,
      aspect_ratio: "1:1",
    });
    return result.url;
  } catch (error) {
    console.error('Error generating Pogemon image:', error);
    return null;
  }
}