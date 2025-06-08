document.addEventListener('DOMContentLoaded', () => {
  const colorButtons = document.querySelectorAll('.color-btn[data-color]');
  const rosewoodBtn = document.querySelector('.fingerboard-btn[data-fingerboard="Rosewood"]');
  const mapleBtn = document.querySelector('.fingerboard-btn[data-fingerboard="Maple"]');
  const colorLabel = document.getElementById('color-label');
  const fingerboardLabel = document.getElementById('fingerboard-label');

  function updateFingerboardButtons(selectedColor) {
    const rosewoodOnly = ['3 Color Sunburst', 'Fen Aubergine', 'Aubergine'];
    const mapleOnly = ['Black', 'Sea Foam Green'];

    // Hide Fingerboard Material Buttons 
    rosewoodBtn.style.display = 'none';
    mapleBtn.style.display = 'none';
    rosewoodBtn.tabIndex = -1;
    mapleBtn.tabIndex = -1;

    if (rosewoodOnly.includes(selectedColor)) {
      rosewoodBtn.style.display = '';
      rosewoodBtn.tabIndex = 0;
      mapleBtn.tabIndex = -1;
      fingerboardLabel.textContent = 'Rosewood';
      // Set Focus on Rosewood
      setTimeout(() => { rosewoodBtn.focus(); }, 0);
    } else if (mapleOnly.includes(selectedColor)) {
      mapleBtn.style.display = '';
      mapleBtn.tabIndex = 0;
      rosewoodBtn.tabIndex = -1;
      fingerboardLabel.textContent = 'Maple';
      // Set Focus on Maple
      setTimeout(() => { mapleBtn.focus(); }, 0);
    } else {
      rosewoodBtn.style.display = '';
      mapleBtn.style.display = '';
      rosewoodBtn.tabIndex = 0;
      mapleBtn.tabIndex = 0;
      fingerboardLabel.textContent = 'Rosewood/Maple';
    }
  }

  colorButtons.forEach(btn => {
    btn.addEventListener('click', function () {
      colorButtons.forEach(b => b.classList.remove('btn-selected'));
      this.classList.add('btn-selected');

      const selectedColor = this.getAttribute('data-color');
      colorLabel.textContent = selectedColor;
      updateFingerboardButtons(selectedColor);
    });
  });

  // Initial auf active Selection
  const activeBtn = document.querySelector('.btn-selected[data-color]');
  if (activeBtn) {
    updateFingerboardButtons(activeBtn.getAttribute('data-color'));
  }

});