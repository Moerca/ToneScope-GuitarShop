document.addEventListener("DOMContentLoaded", function() {
  const grid = document.getElementById('productGrid');
  grid.innerHTML = '';

  window.products.forEach(product => {
    let activeVariant = product.variants[0];
    let previewVariant = null;

    // Card wrapper
    const card = document.createElement('div');
    card.className = "flex flex-col items-center justify-end";

    // Image wrapper (click navigates to specifics.html)
    const imgWrap = document.createElement('div');
    imgWrap.className = "relative w-full aspect-[4/5] bg-white overflow-hidden flex items-center justify-center cursor-pointer";
    imgWrap.tabIndex = 0; 

    imgWrap.addEventListener('click', () => {
      window.location.href = `specifics.html?id=${encodeURIComponent(product.id)}`;
    });

    // Main image
    const imgMain = document.createElement('img');
    imgMain.src = activeVariant.imgMain;
    imgMain.alt = product.name;
    imgMain.className = "product-image absolute inset-0 w-full h-full object-contain transition-opacity duration-500 ease-in-out opacity-100 pointer-events-none";
    if (activeVariant.rotateMain) {
      imgMain.className += " " + activeVariant.rotateMain;
    }
    if (product.id === "Stratocaster-HHS") {
      imgMain.className += " max-h-[380px] sm:max-h-[430px]";
    } else {
      imgMain.className += " max-h-[310px] sm:max-h-[340px]";
    }

    // Hover image
    const imgHover = document.createElement('img');
    imgHover.src = activeVariant.imgHover;
    imgHover.alt = product.name + " Hover";
    imgHover.className = "product-image absolute inset-0 w-full h-full object-contain transition-opacity duration-500 ease-in-out opacity-0 pointer-events-none";
    if (activeVariant.rotateHover) {
      imgHover.className += " " + activeVariant.rotateHover;
    }
    if (product.id === "Stratocaster-HHS") {
      imgHover.className += " max-h-[380px] sm:max-h-[430px]";
    } else {
      imgHover.className += " max-h-[310px] sm:max-h-[340px]";
    }

    // Fade effect on image hover
    imgWrap.addEventListener('mouseenter', () => {
      imgMain.classList.replace('opacity-100','opacity-0');
      imgHover.classList.replace('opacity-0','opacity-100');
    });
    imgWrap.addEventListener('mouseleave', () => {
      imgMain.classList.replace('opacity-0','opacity-100');
      imgHover.classList.replace('opacity-100','opacity-0');
    });

    imgWrap.appendChild(imgMain);
    imgWrap.appendChild(imgHover);
    card.appendChild(imgWrap);

    // Meta wrapper: everything below the image, aligned left and stacked vertically
    const metaWrap = document.createElement("div");
    metaWrap.className = "flex flex-col items-start w-full mt-4 gap-1";

    // Color dots (always shown), left-aligned with text (ml-2)
    const dots = document.createElement('div');
    dots.className = "flex flex-row items-center gap-2 flex-shrink-0 ml-2";
    product.variants.forEach((variant, idx) => {
      const dot = document.createElement('img');
      dot.src = variant.dotImg;
      dot.alt = "Color";

      if (product.variants.length > 1) {
        // Interactive dots for multiple variants
        dot.className = "w-7 h-7 rounded-full border-2 border-gray-300 transition-all duration-300 cursor-pointer select-none" +
          (activeVariant === variant ? " border-black scale-110 ring-2 ring-black" : " opacity-80 hover:scale-110 hover:opacity-100");

        // Preview variant on dot hover
        dot.addEventListener('mouseenter', () => {
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

        // Select variant on dot click
        dot.addEventListener('click', (e) => {
          e.stopPropagation();
          if (activeVariant === variant) return;
          [...dots.children].forEach(d => d.className = "w-7 h-7 rounded-full border-2 border-gray-300 transition-all duration-300 cursor-pointer select-none opacity-80 hover:scale-110 hover:opacity-100");
          dot.className = "w-7 h-7 rounded-full border-2 border-black transition-all duration-300 cursor-pointer select-none scale-110 ring-2 ring-black";
          setTimeout(() => {
            imgMain.src = variant.imgMain;
            imgHover.src = variant.imgHover;
            imgMain.className = imgMain.className.replace(activeVariant.rotateMain || '', '') + " " + (variant.rotateMain || '');
            imgHover.className = imgHover.className.replace(activeVariant.rotateHover || '', '') + " " + (variant.rotateHover || '');
            // Ensure normal state after color selection (no hover effect remains)
            imgMain.classList.remove('opacity-0');
            imgMain.classList.add('opacity-100');
            imgHover.classList.remove('opacity-100');
            imgHover.classList.add('opacity-0');
            activeVariant = variant;
            previewVariant = null;
          }, 150);
        });
      } else {
        // Only one variant: static and highlighted
        dot.className = "w-7 h-7 rounded-full border-2 border-black scale-110 ring-2 ring-black";
      }

      dots.appendChild(dot);
    });

    // On dots mouseleave, reset to active variant (for multiple variants)
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

    metaWrap.appendChild(dots);

    // Product name (below dots, left-aligned)
    const name = document.createElement('div');
    name.className = "px-2 text-base font-medium mt-1";
    name.textContent = product.name;
    metaWrap.appendChild(name);

    // Price (below name), with optional old price (strikethrough) and discounted price in red
    const price = document.createElement('div');
    price.className = "px-2 text-base font-normal mt-1 flex flex-row items-center";
    if (product.oldPrice) {
      // Old price (strikethrough)
      const oldPrice = document.createElement('span');
      oldPrice.className = "line-through text-gray-400";
      oldPrice.textContent = product.oldPrice;
      price.appendChild(oldPrice);

      // New discounted price in red
      const newPrice = document.createElement('span');
      newPrice.className = "text-red-600 font-semibold ml-2";
      newPrice.textContent = product.price || "";
      price.appendChild(newPrice);
    } else {
      price.className += " text-red-600 font-semibold";
      price.textContent = product.price || "";
    }
    metaWrap.appendChild(price);

    card.appendChild(metaWrap);

    grid.appendChild(card);
  });
});