// Get dynamic product ID from URL
const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get("id");
const product = window.products.find(p => p.id === productId);

// If product not found, show error message
if (!product) {
  document.getElementById('guitar-details').innerHTML = "<p>Product not found.</p>";
  throw new Error("Product not found");
}

// State for selected variant and main image index
let selectedVariantIndex = 0;
let mainImageIdx = 0;

/**
 * Returns all gallery images for a variant, without duplicates.
 * @param {Object} variant
 * @returns {string[]} Array of image URLs
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
 * Render the details page for the selected product and variant
 */
function renderDetails() {
  const variant = product.variants[selectedVariantIndex];
  const galleryImages = getGalleryImages(variant);
  const mainImage = galleryImages[mainImageIdx] || galleryImages[0];

  // Thumbnails for gallery images
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

  // Preview variant on hover (swap main image quickly)
  window.previewVariant = function(idx) {
    if (idx === selectedVariantIndex) return;
    const previewVariant = product.variants[idx];
    const previewGalleryImages = getGalleryImages(previewVariant);

    let previewIndex = mainImageIdx;
    if (previewIndex >= previewGalleryImages.length) {
      previewIndex = previewGalleryImages.length - 1;
    }
    const previewImage = previewGalleryImages[previewIndex];
    document.getElementById('mainImage').src = previewImage;
  };
  // End preview on mouse out (restore main image)
  window.endPreviewVariant = function() {
    document.getElementById('mainImage').src = mainImage;
  };

  // Color dots for variant selection
  const colorDots = product.variants.map((v, idx) => `
    <img src="${v.dotImg}" alt="${v.color}"
      class="color-dot${idx === selectedVariantIndex ? ' selected' : ''}" title="${v.color}"
      onclick="selectVariant(${idx})"
      onmouseover="previewVariant(${idx})"
      onmouseout="endPreviewVariant()">
  `).join('');

  // Fingerboard Material (icon + text)
const fingerboardMaterialRow = variant.fingerboardMaterial ? `
  <div class="mb-4">
    <div class="font-semibold">Fingerboard Material: <span class="font-normal">${variant.fingerboardMaterial}</span></div>
    ${variant.fingerboardMaterialImg ? `<div class="mt-2"><img src="${variant.fingerboardMaterialImg}" alt="${variant.fingerboardMaterial}" class="inline-block w-8 h-8 rounded-full border border-gray-400"></div>` : ""}
  </div>
` : "";

  // Body Material (icon + text)
const bodyMaterialRow = `
  <div class="mb-4">
    <div class="font-semibold">Body Material: <span class="font-normal">${variant.bodyMaterial ?? '—'}</span></div>
    ${variant.bodyMaterialImg ? `<div class="mt-2"><img src="${variant.bodyMaterialImg}" alt="${variant.bodyMaterial}" class="inline-block w-8 h-8 rounded-full border border-gray-400"></div>` : ""}
  </div>
  `;

  // Optional video preview
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

  // Details/specifications list
const detailsList = product.details 
  ? `<ul class="no-bullets mb-2">${product.details.map(d => `<li>${d}</li>`).join('')}</ul>`
  : "";
  
  // More details (collapsible sections)
  const moreDetails = (product.moreDetails || []).map(section => `
    <button class="collapsible font-bold text-lg mb-2 w-full text-left bg-gray-100 p-3 rounded">${section.title}</button>
    <div class="content-collapsible bg-gray-50 rounded px-4 py-2 mb-4" style="display:none;">
      ${Array.isArray(section.content) ? '<ul class="list-disc pl-5">' + section.content.map(c => `<li>${c}</li>`).join('') + '</ul>' : section.content}
    </div>
  `).join('');

  // Main render block, styled with Tailwind CSS
  document.getElementById('guitar-details').innerHTML = `
    <h1 class="text-3xl font-bold mb-2">${product.name}</h1>
    <div class="text-gray-700 mb-2">
      <span class="font-semibold">Model:</span> <span class="font-mono">${product.model ?? ''}</span>
    </div>
    <div class="flex gap-4 items-center mb-6">
      <span class="text-2xl font-semibold text-red-600">${product.price}</span>
      <span class="line-through text-gray-400">${product.oldPrice ?? ''}</span>
    </div>
    <!-- Main image -->
    <div class="w-full mb-6">
      <img id="mainImage"
        src="${mainImage}"
        alt="Main Guitar Image"
        class="w-96 h-60 mx-auto bg-white rounded-lg w-full object-contain"/>
    </div>
    <!-- Gallery thumbnails & video -->
    <div class="flex space-x-4 mb-6 overflow-x-auto" id="thumbnailSlider">
      ${galleryImgs}
      ${videoPreview}
    </div>
    <!-- Colors -->
    <div class="mb-4">
      <span class="block font-semibold mb-1">Color:</span>
      ${colorDots}
    </div>
    <!-- Materials (only once, with badge!) -->
    <div class="mb-4">${fingerboardMaterialRow}</div>
    <div class="mb-4">${bodyMaterialRow}</div>
    <!-- Details -->
    <div class="mb-2">${detailsList}</div>
    <!-- More details accordion -->
    <div>${moreDetails}</div>
  `;

  // Setup collapsible sections
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

// Global event handlers for variant & image selection
window.selectVariant = function(idx) {
  // Remember main image index for smooth UX
  const previousMainImageIdx = mainImageIdx;
  selectedVariantIndex = idx;

  const galleryImages = getGalleryImages(product.variants[selectedVariantIndex]);
  if (previousMainImageIdx < galleryImages.length) {
    mainImageIdx = previousMainImageIdx;
  } else {
    mainImageIdx = galleryImages.length - 1;
  }

  renderDetails();
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

// Initial page render
renderDetails();