document.addEventListener("DOMContentLoaded", function () {
  // CATEGORY MAPPING: Button label to filter function
  const categories = [
    {
      label: "Best Sellers",
      filter: (product) => true, // Show all, or implement your own bestseller logic
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

  // Buttons
  const nav = document.querySelector("nav.flex");
  const buttons = Array.from(nav.querySelectorAll("button"));

  // Main heading (updates on filter switch)
  const headline = document.querySelector("section h2");

  // Product render function (calls your render code)
  function renderProducts(filteredProducts) {
    // Render logic is in product-hover.js, so just set window.products and call the render function again
    window.filteredProducts = filteredProducts;
    if (window.renderProductGrid) {
      window.renderProductGrid();
    }
  }

  // Activate button style
  function setActiveButton(idx) {
    buttons.forEach((btn, i) => {
      if (i === idx) {
        btn.classList.add(
          "bg-gray-900",
          "text-white",
          "font-semibold",
          "shadow-sm"
        );
        btn.classList.remove(
          "bg-white",
          "text-gray-700",
          "hover:bg-gray-100"
        );
        btn.setAttribute("aria-pressed", "true");
        btn.focus();
      } else {
        btn.classList.remove(
          "bg-gray-900",
          "text-white",
          "font-semibold",
          "shadow-sm"
        );
        btn.classList.add(
          "bg-white",
          "text-gray-700",
          "hover:bg-gray-100"
        );
        btn.setAttribute("aria-pressed", "false");
      }
    });
  }

  // Filter handler
  function handleFilter(idx) {
    setActiveButton(idx);
    const cat = categories[idx];
    if (headline) headline.textContent = cat.label;
    const filtered = window.products.filter(cat.filter);
    renderProducts(filtered);
  }

  // Attach events, initial focus
  buttons.forEach((btn, idx) => {
    btn.addEventListener("click", () => handleFilter(idx));
  });

  // Focus and show best sellers by default
  handleFilter(0);

  // Optionally: Keyboard navigation (left/right)
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
});

// Product grid rendering override (for filtering)
window.renderProductGrid = function () {
  const grid = document.getElementById('productGrid');
  const products = window.filteredProducts || window.products;
  grid.innerHTML = '';
  // Use your rendering logic from product-hover.js, but use 'products' instead of 'window.products'
  products.forEach(product => {
    // --- COPY THE CARD RENDER CODE FROM product-hover.js HERE ---
    // To avoid duplication, you could move your product card rendering into a function and call it here.
    // For simplicity, just use the rendering logic as you already have, replacing window.products with products.
    // Example:
    if (window.renderProductCard) {
      grid.appendChild(window.renderProductCard(product));
    }
  });
};