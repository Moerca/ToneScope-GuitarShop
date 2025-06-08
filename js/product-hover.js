window.renderProductCard = function(product) {
  let activeVariant = product.variants[0];
  let previewVariant = null;

  // Main wrapper
  const wrapper = document.createElement('div');
  wrapper.className = "flex flex-col items-center justify-start px-4 pb-12 group relative";

  // Bildcontainer (wie gehabt)
  const imgBox = document.createElement('div');
  imgBox.className = "flex items-end justify-center w-full h-64 md:h-72 lg:h-80 xl:h-96 mb-8 relative cursor-pointer";
  const imgMain = document.createElement('img');
  imgMain.src = activeVariant.imgMain;
  imgMain.alt = product.name;
  imgMain.className = "object-contain h-full w-auto mx-auto transition-opacity duration-500 opacity-100 pointer-events-none select-none";
  if (activeVariant.rotateMain) imgMain.className += " " + activeVariant.rotateMain;
  const imgHover = document.createElement('img');
  imgHover.src = activeVariant.imgHover;
  imgHover.alt = product.name + " Hover";
  imgHover.className = "object-contain h-full w-auto mx-auto absolute inset-0 transition-opacity duration-500 opacity-0 pointer-events-none";
  if (activeVariant.rotateHover) imgHover.className += " " + activeVariant.rotateHover;
  imgBox.appendChild(imgMain);
  imgBox.appendChild(imgHover);
  imgBox.addEventListener('mouseenter', () => {
    imgMain.classList.replace('opacity-100','opacity-0');
    imgHover.classList.replace('opacity-0','opacity-100');
  });
  imgBox.addEventListener('mouseleave', () => {
    imgMain.classList.replace('opacity-0','opacity-100');
    imgHover.classList.replace('opacity-100','opacity-0');
  });
  imgBox.addEventListener('click', () => {
    window.location.href = `specifics.html?id=${encodeURIComponent(product.id)}`;
  });
  wrapper.appendChild(imgBox);

  // Gitarrennamen
  const name = document.createElement('div');
  name.className = "text-center mb-1 text-lg font-semibold text-neutral-900 tracking-tight select-none";
  name.textContent = product.name;
  wrapper.appendChild(name);

  // ROW: "4 colors available" ODER die Dots (exakt gleiche Stelle, keine extra Zeile)
  const colorRow = document.createElement('div');
  colorRow.className = "flex justify-center items-center min-h-[1.75rem] mb-2 relative w-full";

  // Text für Farben
  const colorCount = document.createElement('div');
  colorCount.className = "text-sm text-gray-500 transition-opacity duration-200 absolute left-1/2 -translate-x-1/2 opacity-100 group-hover:opacity-0";
  const numColors = product.variants.length;
  colorCount.textContent = numColors === 1
    ? "1 color available"
    : `${numColors} colors available`;

  // Farbdots (bei Hover, sonst versteckt)
  const dots = document.createElement('div');
  dots.className = "flex flex-row gap-2 transition-opacity duration-200 opacity-0 group-hover:opacity-100 absolute left-1/2 -translate-x-1/2";
  product.variants.forEach((variant, idx) => {
    const dot = document.createElement('img');
    dot.src = variant.dotImg;
    dot.alt = variant.color || "Color";
    dot.className = `
      w-5 h-5 rounded-full border-2 border-white shadow transition-all duration-300 cursor-pointer select-none
      hover:scale-110
      ${activeVariant === variant ? "ring-2 ring-black scale-110" : "opacity-80"}
    `.replace(/\s+/g, ' ');

    // Preview auf Dot-Hover
    dot.addEventListener('mouseenter', (e) => {
      previewVariant = variant;
      imgMain.classList.replace('opacity-100','opacity-0');
      imgHover.classList.replace('opacity-100','opacity-0');
      setTimeout(() => {
        imgMain.src = variant.imgMain;
        imgHover.src = variant.imgHover;
        imgMain.className = imgMain.className.replace(activeVariant.rotateMain || '', '') + " " + (variant.rotateMain || '');
        imgHover.className = imgHover.className.replace(activeVariant.rotateHover || '', '') + " " + (variant.rotateHover || '');
        imgMain.classList.replace('opacity-0','opacity-100');
      }, 80);
    });

    // Auswahl auf Klick
    dot.addEventListener('click', (e) => {
      e.stopPropagation();
      if (activeVariant === variant) return;
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

  colorRow.appendChild(colorCount);
  colorRow.appendChild(dots);
  wrapper.appendChild(colorRow);

  // Preis darunter
  const price = document.createElement('div');
  price.className = "flex justify-center items-baseline gap-2 mb-0";
  if (product.oldPrice) {
    const oldPrice = document.createElement('span');
    oldPrice.className = "line-through text-neutral-300 text-base";
    oldPrice.textContent = product.oldPrice;
    price.appendChild(oldPrice);

    const newPrice = document.createElement('span');
    newPrice.className = "text-red-500 font-bold text-xl";
    newPrice.textContent = product.price || "";
    price.appendChild(newPrice);
  } else {
    const onlyPrice = document.createElement('span');
    onlyPrice.className = "text-red-500 font-bold text-xl";
    onlyPrice.textContent = product.price || "";
    price.appendChild(onlyPrice);
  }
  wrapper.appendChild(price);

  return wrapper;
};

window.renderProductGrid = function(products) {
  const grid = document.getElementById('productGrid');
  grid.innerHTML = '';
  (products || window.products).forEach(product => {
    grid.appendChild(window.renderProductCard(product));
  });
};

// Initial Load
document.addEventListener("DOMContentLoaded", function() {
  window.renderProductGrid(window.products);
});