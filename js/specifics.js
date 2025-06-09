const productId = "Stratocaster-HHS";
const product = window.products.find(p => p.id === productId);
let selectedVariantIndex = 0;
let mainImageIdx = 0;

function getGalleryImages(variant) {
  let images = [];
  if (variant.imgMain) images.push(variant.imgMain);
  if (variant.imgHover && variant.imgHover !== variant.imgMain) images.push(variant.imgHover);
  if (Array.isArray(variant.detailImages)) {
    images = images.concat(variant.detailImages);
  }
  // If Doubles
  return [...new Set(images)];
}

function renderDetails() {
  const variant = product.variants[selectedVariantIndex];
  const galleryImages = getGalleryImages(variant);
  const mainImage = galleryImages[mainImageIdx] || galleryImages[0];

  // Thumbnails for all Galerie-Imgs
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

// Preview Hover
window.previewVariant = function(idx) {
  if (idx === selectedVariantIndex) return;
  const variant = product.variants[idx];
  const galleryImages = getGalleryImages(variant);

  // Show the image at the same index as mainImageIdx, or the last image if not enough images
  let previewIndex = mainImageIdx;
  if (previewIndex >= galleryImages.length) {
    previewIndex = galleryImages.length - 1;
  }
  const mainImage = galleryImages[previewIndex];
  document.getElementById('mainImage').src = mainImage;
};

  // Color Variations / Dots
  const colorDots = product.variants.map((v, idx) => `
    <img src="${v.dotImg}" alt="${v.color}" 
    class="color-dot${idx === selectedVariantIndex ? ' selected' : ''}" title="${v.color}" 
    onclick="selectVariant(${idx})"
    onmouseover="previewVariant(${idx})"
    onmouseout="endPreviewVariant()">
  `).join('');

  // Video (optional)
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

  // Details/Specs
  const detailsList = product.details ? `<ul class="list-disc pl-5 mb-2">${product.details.map(d => `<li>${d}</li>`).join('')}</ul>` : "";
  const moreDetails = (product.moreDetails || []).map(section => `
    <button class="collapsible font-bold text-lg mb-2 w-full text-left bg-gray-100 p-3 rounded">${section.title}</button>
    <div class="content-collapsible bg-gray-50 rounded px-4 py-2 mb-4">
      ${Array.isArray(section.content) ? '<ul class="list-disc pl-5">' + section.content.map(c => `<li>${c}</li>`).join('') + '</ul>' : section.content}
    </div>
  `).join('');

  // Render Block
  document.getElementById('guitar-details').innerHTML = `
    <h1 class="text-3xl font-bold mb-2">${product.name}</h1>
    <div class="text-gray-700 mb-2">
      <span class="font-semibold">Model:</span> <span class="font-mono">${product.model}</span>
    </div>
    <div class="flex gap-4 items-center mb-6">
      <span class="text-2xl font-semibold text-red-600">${product.price}</span>
      <span class="line-through text-gray-400">${product.oldPrice}</span>
    </div>
    <!-- Hauptbild -->
    <div class="w-full mb-6">
      <img id="mainImage"
       src="${mainImage}" 
       alt="Main Guitar Image" 
       class="w-96 h-60 mx-auto bg-white rounded-lg w-full object-contain"/>
    </div>
    <!-- Galerie & Video -->
    <div class="flex space-x-4 mb-6 overflow-x-auto" id="thumbnailSlider">
      ${galleryImgs}
      ${videoPreview}
    </div>
    <!-- Farben -->
    <div class="mb-4">
      <span class="block font-semibold mb-1">Color:</span>
      ${colorDots}
    </div>
    <!-- Materialien -->
    <div class="mb-4">
      <span class="block font-semibold">Fingerboard Material:</span>
      <span class="block mb-2">${variant.fingerboardMaterial ? variant.fingerboardMaterial : '—'}</span>
      <span class="block font-semibold">Body Material:</span>
      <span class="block mb-2">${variant.bodyMaterial ? variant.bodyMaterial : '—'}</span>
    </div>
    <!-- Details -->
    <div class="mb-2">${detailsList}</div>
    <!-- Ausklappbar -->
    <div>${moreDetails}</div>
  `;

  // Collapsible Setup
  document.querySelectorAll('.collapsible').forEach(btn => {
    btn.addEventListener('click', function() {
      this.classList.toggle('active');
      var content = this.nextElementSibling;
      if (content.style.display === "block") {
        content.style.display = "none";
      } else {
        content.style.display = "block";
      }
    });
  });
}

// global Event-Funkcions
window.selectVariant = function(idx) {
// Remember current picture Position
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
  var video = document.getElementById('guitarVideo');
  if (video) {
    video.style.display = 'block';
    video.play();
  }
};

// Initial Render
renderDetails();