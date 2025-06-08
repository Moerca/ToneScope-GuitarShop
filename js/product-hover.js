// Renders a single product card for the guitar grid/shop
window.renderProductCard = function(product) {
  // Track which variant is currently active (main) and which is being previewed (on dot hover)
  let activeVariant = product.variants[0];
  let previewVariant = null;

  // === Main Card Container ===
  const wrapper = document.createElement('div');
  // Use flex column layout, with padding and relative positioning for hover effects
  wrapper.className = "flex flex-col items-center justify-start px-4 pb-12 group relative";

  // === Image Section ===
  // This container ensures all guitars are vertically aligned
  const imgBox = document.createElement('div');
  imgBox.className = "flex items-end justify-center w-full h-64 md:h-72 lg:h-80 xl:h-96 mb-8 relative cursor-pointer";

  // Main (default) guitar image
  const imgMain = document.createElement('img');
  imgMain.src = activeVariant.imgMain;
  imgMain.alt = product.name;
  imgMain.className = "object-contain h-full w-auto mx-auto transition-opacity duration-500 opacity-100 pointer-events-none select-none";
  if (activeVariant.rotateMain) imgMain.className += " " + activeVariant.rotateMain;

  // Hover image (shows when hovering over the card)
  const imgHover = document.createElement('img');
  imgHover.src = activeVariant.imgHover;
  imgHover.alt = product.name + " Hover";
  imgHover.className = "object-contain h-full w-auto mx-auto absolute inset-0 transition-opacity duration-500 opacity-0 pointer-events-none";
  if (activeVariant.rotateHover) imgHover.className += " " + activeVariant.rotateHover;

  // Image hover logic: fade to hover image on mouse enter/leave
  imgBox.addEventListener('mouseenter', () => {
    imgMain.classList.replace('opacity-100','opacity-0');
    imgHover.classList.replace('opacity-0','opacity-100');
  });
  imgBox.addEventListener('mouseleave', () => {
    imgMain.classList.replace('opacity-0','opacity-100');
    imgHover.classList.replace('opacity-100','opacity-0');
  });

  // Clicking the guitar image opens the product detail page
  imgBox.addEventListener('click', () => {
    window.location.href = `specifics.html?id=${encodeURIComponent(product.id)}`;
  });

  // Layer images so we can animate between them
  const imgWrap = document.createElement('div');
  imgWrap.className = "relative flex justify-center items-end w-full h-full";
  imgWrap.appendChild(imgMain);
  imgWrap.appendChild(imgHover);

  imgBox.appendChild(imgWrap);
  wrapper.appendChild(imgBox);

  // === Product Name ===
  // Large, bold, centered guitar name
  const name = document.createElement('div');
  name.className = "text-center mb-1 text-lg font-semibold text-neutral-900 tracking-tight select-none";
  name.textContent = product.name;
  wrapper.appendChild(name);

  // === Color Row (shows either text or color dots, same row) ===
  // This row is always present, and swaps content on hover
  const colorRow = document.createElement('div');
  colorRow.className = "flex justify-center items-center min-h-[1.75rem] mb-2 relative w-full";

  // -- Color count text ("3 colors available"), centered --
  const colorCount = document.createElement('div');
  // By default, visible. On hover, fades out (opacity-0)
  colorCount.className = "text-sm text-gray-500 transition-opacity duration-200 absolute left-1/2 -translate-x-1/2 opacity-100 group-hover:opacity-0";
  const numColors = product.variants.length;
  colorCount.textContent = numColors === 1
    ? "1 color available"
    : `${numColors} colors available`;

  // -- Color Dots (hidden by default, shown on hover, same row as colorCount) --
  const dots = document.createElement('div');
  // Absolutely positioned, fades in on group hover
  dots.className = "flex flex-row gap-2 transition-opacity duration-200 opacity-0 group-hover:opacity-100 absolute left-1/2 -translate-x-1/2";

  // For each guitar variant, add a dot (mini image)
  product.variants.forEach((variant, idx) => {
    const dot = document.createElement('img');
    dot.src = variant.dotImg;
    dot.alt = variant.color || "Color";
    dot.className = `
      w-5 h-5 rounded-full border-2 border-white shadow transition-all duration-300 cursor-pointer select-none
      hover:scale-110
      ${activeVariant === variant ? "ring-2 ring-black scale-110" : "opacity-80"}
    `.replace(/\s+/g, ' ');

    // --- Dot hover: Preview this variant's image without switching selection
    dot.addEventListener('mouseenter', (e) => {
      previewVariant = variant;
      imgMain.classList.replace('opacity-100','opacity-0');
      imgHover.classList.replace('opacity-100','opacity-0');
      setTimeout(() => {
        imgMain.src = variant.imgMain;
        imgHover.src = variant.imgHover;
        // Handle special rotation classes if present
        imgMain.className = imgMain.className.replace(activeVariant.rotateMain || '', '') + " " + (variant.rotateMain || '');
        imgHover.className = imgHover.className.replace(activeVariant.rotateHover || '', '') + " " + (variant.rotateHover || '');
        imgMain.classList.replace('opacity-0','opacity-100');
      }, 80);
    });

    // --- Dot click: Switch to this variant as "selected"
    dot.addEventListener('click', (e) => {
      e.stopPropagation();
      if (activeVariant === variant) return;
      // Remove ring from all dots, add to the selected one
      [...dots.children].forEach(d => d.className = `
        w-5 h-5 rounded-full border-2 border-white shadow transition-all duration-300 cursor-pointer select-none opacity-80 hover:scale-110
      `.replace(/\s+/g, ' '));
      dot.className = `
        w-5 h-5 rounded-full border-2 border-white shadow transition-all duration-300 cursor-pointer select-none ring-2 ring-black scale-110 hover:scale-110
      `.replace(/\s+/g, ' ');
      setTimeout(() => {
        imgMain.src = variant.imgMain;
        imgHover.src = variant.imgHover;
        imgMain.className = imgMain.className.replace(activeVariant.rotateMain || '', '') + " " + (variant.rotateMain || '');
        imgHover.className = imgHover.className.replace(activeVariant.rotateHover || '', '') + " " + (variant.rotateHover || '');
        imgMain.classList.remove('opacity-0');
        imgMain.classList.add('opacity-100');
        imgHover.classList.remove('opacity-100');
        imgHover.classList.add('opacity-0');
        activeVariant = variant;
        previewVariant = null;
      }, 150);
    });

    dots.appendChild(dot);
  });

  // -- Optional: When leaving the dot area, revert preview to selected variant
  if (product.variants.length > 1) {
    dots.addEventListener('mouseleave', () => {
      if (!previewVariant) return;
      imgMain.classList.replace('opacity-100','opacity-0');
      imgHover.classList.replace('opacity-100','opacity-0');
      setTimeout(() => {
        imgMain.src = activeVariant.imgMain;
        imgHover.src = activeVariant.imgHover;
        imgMain.className = imgMain.className.replace(previewVariant.rotateMain || '', '') + " " + (activeVariant.rotateMain || '');
        imgHover.className = imgHover.className.replace(previewVariant.rotateHover || '', '') + " " + (activeVariant.rotateHover || '');
        imgMain.classList.replace('opacity-0','opacity-100');
        previewVariant = null;
      }, 80);
    });
  }

  // Add both colorCount and dots to the color row (they swap on hover)
  colorRow.appendChild(colorCount);
  colorRow.appendChild(dots);
  wrapper.appendChild(colorRow);

  // === Price Section ===
  // Shows new/old price (if discounted) or just price
  const price = document.createElement('div');
  price.className = "flex justify-center items-baseline gap-2 mb-0";
  if (product.oldPrice) {
    // Old price (strikethrough)
    const oldPrice = document.createElement('span');
    oldPrice.className = "line-through text-neutral-300 text-base";
    oldPrice.textContent = product.oldPrice;
    price.appendChild(oldPrice);

    // New price (highlighted)
    const newPrice = document.createElement('span');
    newPrice.className = "text-red-500 font-bold text-xl";
    newPrice.textContent = product.price || "";
    price.appendChild(newPrice);
  } else {
    // Only price
    const onlyPrice = document.createElement('span');
    onlyPrice.className = "text-red-500 font-bold text-xl";
    onlyPrice.textContent = product.price || "";
    price.appendChild(onlyPrice);
  }
  wrapper.appendChild(price);

  // Return the fully built product card node
  return wrapper;
};

// Renders a grid of products (array of product objects)
window.renderProductGrid = function(products) {
  const grid = document.getElementById('productGrid');
  grid.innerHTML = '';
  (products || window.products).forEach(product => {
    grid.appendChild(window.renderProductCard(product));
  });
};

// On page load, render the product grid
document.addEventListener("DOMContentLoaded", function() {
  window.renderProductGrid(window.products);
});