export function setupPrintButton() {
  const printBtn = document.getElementById('printBtn');
  printBtn.addEventListener('click', () => {
    // Add print class to all visible cards
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
      card.classList.add('print-section');
      
      // Ensure the current visible side is shown in print
      const cardInner = card.querySelector('.card-inner');
      const cardFront = card.querySelector('.card-front');
      const cardBack = card.querySelector('.card-back');
      
      if (cardInner.classList.contains('flipped')) {
        cardBack.style.visibility = 'visible';
        cardFront.style.visibility = 'hidden';
      } else {
        cardFront.style.visibility = 'visible';
        cardBack.style.visibility = 'hidden';
      }
    });

    // Print
    window.print();

    // Remove print classes and restore visibility after printing
    setTimeout(() => {
      cards.forEach(card => {
        card.classList.remove('print-section');
        const cardFront = card.querySelector('.card-front');
        const cardBack = card.querySelector('.card-back');
        cardFront.style.visibility = '';
        cardBack.style.visibility = '';
      });
    }, 100);
  });
}