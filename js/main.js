// ==============================
// ToneScope Main Script
// ==============================

// --- Topbar Floating & Close Functionality ---

document.addEventListener("DOMContentLoaded", function() {
  const topbar = document.getElementById('top-bar');
  const closeTopbarBtn = document.getElementById('close-topbar');
  const header = document.getElementById('header');

  if (closeTopbarBtn && topbar && header) {
    closeTopbarBtn.addEventListener('click', function () {
      topbar.style.display = 'none';
      header.classList.remove('pt-16', 'pt-12', 'pt-10', 'pt-8', 'pt-6', 'pt-4');
      header.classList.add('pt-2'); 
      header.style.paddingTop = "-2000px";
    });
  }
});

  // --- Product Category Navigation ---

  // Define product categories and their filter logic
  const categories = [
    {
      label: "Best Sellers",
      filter: (product) => true, // Show all products or implement custom bestseller logic
    },
    {
      label: "Taylor Line",
      filter: (product) => product.name.startsWith("Taylor"),
    },
    {
      label: "Gibson",
      filter: (product) => product.name.toLowerCase().includes("gibson"),
    },
    {
      label: "Fender",
      filter: (product) => product.name.toLowerCase().includes("stratocaster") || product.name.toLowerCase().includes("fender"),
    },
    {
      label: "Martin",
      filter: (product) => product.name.toLowerCase().includes("martin"),
    },
  ];

  // Get navigation and category buttons
  const nav = document.querySelector("nav.flex");
  const buttons = nav ? Array.from(nav.querySelectorAll("button")) : [];

  // Get main headline (updates on filter switch)
  const headline = document.querySelector("section h2");

  // Render product cards (call external render function)
  function renderProducts(filteredProducts) {
    window.filteredProducts = filteredProducts;
    if (window.renderProductGrid) {
      window.renderProductGrid();
    }
  }

  // Set active button style
  function setActiveButton(idx) {
    buttons.forEach((btn, i) => {
      if (i === idx) {
        btn.classList.add("bg-gray-900", "text-white", "font-semibold", "shadow-sm");
        btn.classList.remove("bg-white", "text-gray-700", "hover:bg-gray-100");
        btn.setAttribute("aria-pressed", "true");
        btn.focus();
      } else {
        btn.classList.remove("bg-gray-900", "text-white", "font-semibold", "shadow-sm");
        btn.classList.add("bg-white", "text-gray-700", "hover:bg-gray-100");
        btn.setAttribute("aria-pressed", "false");
      }
    });
  }

  // Handle category filter selection
  function handleFilter(idx) {
    setActiveButton(idx);
    const cat = categories[idx];
    if (headline) headline.textContent = cat.label;
    const filtered = window.products.filter(cat.filter);
    renderProducts(filtered);
  }

  // Attach click events to category buttons
  buttons.forEach((btn, idx) => {
    btn.addEventListener("click", () => handleFilter(idx));
  });

  // Default: show best sellers and set focus
  handleFilter(0);

  // Keyboard navigation for the category bar (left/right arrows)
  if (nav) {
    nav.addEventListener("keydown", (e) => {
      const activeIdx = buttons.findIndex((b) => b.getAttribute("aria-pressed") === "true");
      if (e.key === "ArrowRight") {
        e.preventDefault();
        const next = (activeIdx + 1) % buttons.length;
        buttons[next].focus();
        handleFilter(next);
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        const prev = (activeIdx - 1 + buttons.length) % buttons.length;
        buttons[prev].focus();
        handleFilter(prev);
      }
    });
  }

  // --- Product Grid Rendering Override (for Filtering) ---

  // This function is called after category filtering to render visible products.
  window.renderProductGrid = function () {
    const grid = document.getElementById('productGrid');
    const products = window.filteredProducts || window.products;
    grid.innerHTML = '';
    // Use your own card rendering logic (e.g. imported from product-hover.js)
    products.forEach(product => {
      if (window.renderProductCard) {
        grid.appendChild(window.renderProductCard(product));
      }
    });
  };

