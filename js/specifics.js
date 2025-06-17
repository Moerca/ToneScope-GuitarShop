// Get dynamic product ID from URL
const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get("id");
const product = window.products.find(p => p.id === productId);

if (!product) {
  document.getElementById('guitar-details').innerHTML = "<p>Product not found.</p>";
  throw new Error("Product not found");
}

let selectedVariantIndex = 0;
let mainImageIdx = 0;

/**
 * Returns all gallery images for a variant, without duplicates.
 */
function getGalleryImages(variant) {
  let images = [];
  if (variant.imgMain) images.push(variant.imgMain);
  if (variant.imgHover && variant.imgHover !== variant.imgMain) images.push(variant.imgHover);
  if (Array.isArray(variant.detailImages)) {
    images = images.concat(variant.detailImages);
  }
  // Remove duplicates
  return [...new Set(images)];
}

/**
 * Render the details page for the selected product and variant (for small screens)
 */
function renderDetails() {
  const variant = product.variants[selectedVariantIndex];
  const galleryImages = getGalleryImages(variant);
  const mainImage = galleryImages[mainImageIdx] || galleryImages[0];

  const galleryImgs = galleryImages.map((img, idx) =>
    `<img src="${img}" alt="gallery${idx}"
      class="w-24 h-24 object-contain bg-white cursor-pointer thumbnail transition
      border-2 border-gray-300
      ${mainImageIdx === idx ? 'border-4 border-gray-500' : ''}"
      style="border-radius:6px"
      onclick="setMainImageIdx(${idx})"
      tabindex="0"
    >`
  ).join('');

  const selectedColorName = variant.color ?? '—';
  const colorDots = product.variants.map((v, idx) => `
    <img src="${v.dotImg}" alt="${v.color}"
      class="color-dot${idx === selectedVariantIndex ? ' selected' : ''}" title="${v.color}"
      onclick="selectVariant(${idx})"
      onmouseover="previewVariant(${idx})"
      onmouseout="endPreviewVariant()">
  `).join('');

  const colorSection = `
    <div class="mb-4">
      <div class="font-semibold">Color: <span id="color-name" class="font-normal">${selectedColorName}</span></div>
      <div class="mt-2 flex gap-2">${colorDots}</div>
    </div>
  `;

  const fingerboardMaterialRow = variant.fingerboardMaterial ? `
    <div class="mb-4" id="fingerboard-material">
      <div class="font-semibold">Fingerboard Material: <span class="font-normal">${variant.fingerboardMaterial}</span></div>
      ${variant.fingerboardMaterialImg ? `<div class="mt-2"><img src="${variant.fingerboardMaterialImg}" alt="${variant.fingerboardMaterial}" class="inline-block w-8 h-8 rounded-full border border-gray-400"></div>` : ""}
    </div>
  ` : `<div class="mb-4" id="fingerboard-material"></div>`;

  const bodyMaterialRow = `
    <div class="mb-4" id="body-material">
      <div class="font-semibold">Body Material: <span class="font-normal">${variant.bodyMaterial ?? '—'}</span></div>
      ${variant.bodyMaterialImg ? `<div class="mt-2"><img src="${variant.bodyMaterialImg}" alt="${variant.bodyMaterial}" class="inline-block w-8 h-8 rounded-full border border-gray-400"></div>` : ""}
    </div>
  `;

  let videoPreview = "";
  if (product.video) {
    videoPreview = `
      <div class="w-24 h-24 rounded bg-gray-200 flex items-center justify-center cursor-pointer relative" onclick="playVideo()">
        <i class="fa fa-play text-2xl text-red-600"></i>
        <video id="guitarVideo" class="absolute inset-0 w-full h-full object-cover rounded" style="display:none;" controls>
          <source src="${product.video}" type="video/mp4">
        </video>
      </div>
    `;
  }

  const detailsList = product.details 
    ? `<ul class="no-bullets mb-2">${product.details.map(d => `<li>${d}</li>`).join('')}</ul>`
    : "";

  const moreDetails = (product.moreDetails || []).map(section => `
    <button class="collapsible font-bold text-lg mb-2 w-full text-left bg-gray-100 p-3 rounded">${section.title}</button>
    <div class="content-collapsible bg-gray-50 rounded px-4 py-2 mb-4" style="display:none;">
      ${Array.isArray(section.content) ? '<ul class="list-disc pl-5">' + section.content.map(c => `<li>${c}</li>`).join('') + '</ul>' : section.content}
    </div>
  `).join('');

  document.getElementById('guitar-details').innerHTML = `
    <h1 class="text-3xl font-bold mb-2">${product.name}</h1>
    <div class="text-gray-700 mb-2">
      <span class="font-semibold">Model:</span> <span class="font-mono">${product.model ?? ''}</span>
    </div>
    <div class="flex gap-4 items-center mb-6">
      <span class="text-2xl font-semibold text-red-600">${product.price}</span>
      <span class="line-through text-gray-400">${product.oldPrice ?? ''}</span>
    </div>
    <div class="w-full mb-6">
      <img id="mainImage"
        src="${mainImage}"
        alt="Main Guitar Image"
        class="w-96 h-60 mx-auto bg-white rounded-lg w-full object-contain"
      />
    </div>
    <div class="flex space-x-4 mb-6 overflow-x-auto" id="thumbnailSlider">
      ${galleryImgs}
      ${videoPreview}
    </div>
    ${colorSection}
    ${fingerboardMaterialRow}
    ${bodyMaterialRow}
    <div class="mb-2">${detailsList}</div>
    <div>${moreDetails}</div>
  `;

  document.querySelectorAll('.collapsible').forEach(btn => {
    btn.addEventListener('click', function() {
      this.classList.toggle('active');
      const content = this.nextElementSibling;
      if (!content) return;
      if (content.style.display === "block") {
        content.style.display = "none";
      } else {
        content.style.display = "block";
      }
    });
  });
}

/**
 * Render the fullscreen gallery (for large screens)
 * - First image: large, full width, never cropped
 * - All other images: grid, two columns, object-fit: contain
 * - Sticky shrinking header with name and tabs
 */
function renderFullscreenGallery() {
  const variant = product.variants[selectedVariantIndex];
  const images = getGalleryImages(variant);

  // Navigation tabs (static, can expand as needed)
  const navTabs = [
    { name: "Details", id: "tab-details" },
    { name: "Specs", id: "tab-specs" },
    { name: "Highlights", id: "tab-highlights" },
    { name: "Downloads", id: "tab-downloads" },
    { name: "Compare", id: "tab-compare" }
  ];

  // Build navigation bar
  const navBar = `
    <div class="fullscreen-sticky-header" id="fullscreenHeader">
      <div class="guitar-title">${product.name}</div>
      <div class="fullscreen-nav-tabs">
        ${navTabs.map(tab => 
          `<button>${tab.name}</button>`
        ).join('')}
      </div>
    </div>
  `;

  // First image: single, large, full width, never cropped
  const firstImageHtml = images.length > 0 ? `
    <div class="fullscreen-hero-image">
      <img src="${images[0]}" alt="Hero image">
    </div>
  ` : '';

  // All other images: grid, 2 columns, object-fit: contain
  const otherImages = images.slice(1);
  const otherImagesHtml = otherImages.length
    ? `
      <div class="fullscreen-image-grid">
        ${otherImages.map((img, i) =>
          `<img src="${img}" alt="Gallery image ${i+2}">`
        ).join('')}
      </div>
    `
    : '';

  // Build the right info panel
  const variantColor = variant.color ?? '—';
  const infoHtml = `
    <div>
      <h2 class="text-2xl font-bold mb-2">${product.name}</h2>
      <div class="text-gray-700 mb-2">
        <span class="font-semibold">Model:</span> <span class="font-mono">${product.model ?? ''}</span>
      </div>
      <ul style="list-style:disc; margin:0 0 1.5em 1em; color:#222;font-size:1.08em;">
        ${(product.details || []).map(d => `<li>${d}</li>`).join('')}
      </ul>
      <div style="margin-bottom:1.5em;">
        <span style="font-weight:600;">Color:</span> ${variantColor}
        <div style="margin:0.5em 0 0.7em 0; display:flex; gap:0.5em;">
          ${product.variants.map(v =>
            `<span style="display:inline-block;width:30px;height:30px;border-radius:50%;background:${v.dotImg ? `url('${v.dotImg}') center/cover` : '#ececec'};border:2px solid #ddd;"></span>`
          ).join('')}
        </div>
      </div>
      <div style="margin-bottom:1.2em;">
        <span style="font-weight:600;">Fingerboard Material:</span> ${variant.fingerboardMaterial ?? '—'}
        ${variant.fingerboardMaterialImg ? `<div style="margin-top:0.4em;"><img src="${variant.fingerboardMaterialImg}" alt="${variant.fingerboardMaterial}" style="width:38px;height:38px;border-radius:50%;border:1.5px solid #ccc;"></div>` : ''}
      </div>
      <div style="margin-bottom:1.2em;">
        <span style="font-weight:600;">Body Material:</span> ${variant.bodyMaterial ?? '—'}
        ${variant.bodyMaterialImg ? `<div style="margin-top:0.4em;"><img src="${variant.bodyMaterialImg}" alt="${variant.bodyMaterial}" style="width:38px;height:38px;border-radius:50%;border:1.5px solid #ccc;"></div>` : ''}
      </div>
      <div>
        <a href="#" style="font-weight:500;color:#1375dc;text-decoration:underline;">View product details</a>
      </div>
    </div>
  `;

  document.getElementById('fullscreen-gallery').innerHTML = `
    ${navBar}
    <div class="fullscreen-flex-main">
      <div class="gallery-flex-left">
        ${firstImageHtml}
        ${otherImagesHtml}
      </div>
      <div class="fullscreen-flex-right">
        ${infoHtml}
      </div>
    </div>
  `;

  // Shrink header on scroll
  const galleryLeft = document.querySelector('.gallery-flex-left');
  const header = document.getElementById('fullscreenHeader');
  if (galleryLeft && header) {
    galleryLeft.onscroll = function() {
      if (galleryLeft.scrollTop > 40) {
        header.classList.add("shrink");
      } else {
        header.classList.remove("shrink");
      }
    }
  }
}

/**
 * Responsive switch between details and fullscreen gallery based on screen size.
 * Shows fullscreen for width >= 1280px, otherwise details view.
 */
function updateLayoutMode() {
  if(window.innerWidth >= 1280) {
    document.getElementById('guitar-details').style.display = 'none';
    document.getElementById('fullscreen-gallery').style.display = 'block';
    renderFullscreenGallery();
  } else {
    document.getElementById('guitar-details').style.display = 'block';
    document.getElementById('fullscreen-gallery').style.display = 'none';
    renderDetails();
  }
}

window.addEventListener('resize', updateLayoutMode);
window.addEventListener('DOMContentLoaded', updateLayoutMode);

window.previewVariant = function(idx) {
  if (idx === selectedVariantIndex) return;
  const previewVariant = product.variants[idx];
  const previewGalleryImages = getGalleryImages(previewVariant);

  let previewIndex = mainImageIdx;
  if (previewIndex >= previewGalleryImages.length) {
    previewIndex = previewGalleryImages.length - 1;
  }
  const previewImage = previewGalleryImages[previewIndex];
  const mainImageEl = document.getElementById('mainImage');
  if(mainImageEl) mainImageEl.src = previewImage;

  const fingerboardContainer = document.getElementById('fingerboard-material');
  if (fingerboardContainer) {
    if (previewVariant.fingerboardMaterial) {
      fingerboardContainer.innerHTML = `
        <div class="font-semibold">Fingerboard Material: <span class="font-normal">${previewVariant.fingerboardMaterial}</span></div>
        ${previewVariant.fingerboardMaterialImg ? `<div class="mt-2"><img src="${previewVariant.fingerboardMaterialImg}" alt="${previewVariant.fingerboardMaterial}" class="inline-block w-8 h-8 rounded-full border border-gray-400"></div>` : ""}
      `;
    } else {
      fingerboardContainer.innerHTML = "";
    }
  }

  const bodyContainer = document.getElementById('body-material');
  if (bodyContainer) {
    bodyContainer.innerHTML = `
      <div class="font-semibold">Body Material: <span class="font-normal">${previewVariant.bodyMaterial ?? '—'}</span></div>
      ${previewVariant.bodyMaterialImg ? `<div class="mt-2"><img src="${previewVariant.bodyMaterialImg}" alt="${previewVariant.bodyMaterial}" class="inline-block w-8 h-8 rounded-full border border-gray-400"></div>` : ""}
    `;
  }

  const colorName = document.getElementById('color-name');
  if (colorName) {
    colorName.textContent = previewVariant.color ?? '—';
  }

  document.querySelectorAll('.color-dot').forEach((dot, dotIdx) => {
    if (dotIdx === idx) {
      dot.classList.add('selected');
    } else {
      dot.classList.remove('selected');
    }
  });
};

window.endPreviewVariant = function() {
  renderDetails();
};

window.selectVariant = function(idx) {
  const previousMainImageIdx = mainImageIdx;
  selectedVariantIndex = idx;

  const galleryImages = getGalleryImages(product.variants[selectedVariantIndex]);
  if (previousMainImageIdx < galleryImages.length) {
    mainImageIdx = previousMainImageIdx;
  } else {
    mainImageIdx = galleryImages.length - 1;
  }

  updateLayoutMode();
};

window.setMainImageIdx = function(idx) {
  mainImageIdx = idx;
  renderDetails();
};

window.playVideo = function() {
  const video = document.getElementById('guitarVideo');
  if (video) {
    video.style.display = 'block';
    video.play();
  }
};