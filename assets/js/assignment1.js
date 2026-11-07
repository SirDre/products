/**
 * Assignment 1 - Single-page application milestone.
 *
 * Renders the first 20 products of the supplied catalogue as a grid of cards.
 * Clicking a thumbnail alerts the product id; clicking the "+" button alerts
 * the product id and title.
 *
 * Authors: Andre Gardiner
 */

// The catalogue data is available via a static import
import catalogue from '../data/data-minifed.json' with { type: 'json' };

// verify the products array was created from the json file
console.log(catalogue);

/** Values that tune the application, gathered in one place. */
const CONFIG = {
  productLimit: 20,
  locale: 'en-CA',
  currency: 'CAD'
};

/** Price formatter */
const priceFormatter = new Intl.NumberFormat(CONFIG.locale, {
  style: 'currency',
  currency: CONFIG.currency
});


/** The products currently on screen, used by the click handler. */
let displayedProducts = [];

/** Items added to the cart during this session. */
let cartCount = 0;


/** ---- Data ----  */

/**
 * Finds a displayed product by its id. Replaces the keyed lookup previously used for this purpose.
 */
function findProduct(id) {
  for (let product of displayedProducts) {
    if (product.id === id) {
      return product;
    }
  }
  return null;
}

/**
 * Reads the products out of the catalogue and keeps only the first `limit`. 
 */
function selectProducts(source, limit) {

  if (source && Array.isArray(source.products)) {
    return source.products.slice(0, limit);
  }
  return [];

}


/** ---- Rendering ---- */

/**
 * Builds one product card by cloning the sample card declared in index.html.
 */
function createProductCard(product, template) {

  const card = template.cloneNode(true);
  const image = card.querySelector('.card_image');
  const cartButton = card.querySelector('[data-action="add_to_cart"]');

  const title = product.title;

  // image carries the same action as the View button and the one delegated listener below handles both.
  image.dataset.action = 'view_product';
  image.dataset.id = product.id;
  image.setAttribute('src', product.thumbnail);
  image.setAttribute('alt', title);

  // Broken or missing image URL: fall back to the CSS placeholder.
  image.addEventListener('error', function () {
    card.classList.add('card_no_image');
  });


  card.dataset.id = product.id;

  card.querySelector('.card_title').textContent = title;
  card.querySelector('.card_price').textContent = priceFormatter.format(product.price);
 
  cartButton.dataset.id = product.id;
  cartButton.setAttribute('aria-label', `Add ${title} to cart`);

  return card;
}

/**
 * Replaces the contents of the results grid with the given products and remembers them.
 * @param {object[]} products Products to display.
 * @param {HTMLElement} grid The <ul> that holds the cards.
 */
function renderProducts(products, grid) {
  const template = document.querySelector('#product_card_template .card');

  displayedProducts = products;

  // Remove the old cards a node at a time rather than assigning innerHTML.
  while (grid.firstChild) {
    grid.removeChild(grid.firstChild);
  }

  for (let product of products) {
    grid.appendChild(createProductCard(product, template));
  }
}

/**
 * Shows how many products are on screen, or an explanation when there are none.
 * @param {number} count Number of products rendered.
 * @param {string} [message] Message to show when the count is zero.
 */
function renderResultsStatus(count, message) {
  const countElement = document.querySelector('#results_count');
  const messageElement = document.querySelector('#results_message');

  countElement.textContent = count === 1 ? '1 product' : `${count} products`;

  if (count === 0) {
    messageElement.textContent = message ? message :
      'No products could be loaded.';
    messageElement.removeAttribute('hidden');
  } else {
    messageElement.setAttribute('hidden', 'hidden');
  }
}

/** Writes the current cart total into the header badge. */
function renderCartCount() {
  let cartCountElement = document.querySelector('#cart-count');
  cartCountElement.textContent = cartCount;
  
}

/* --- Actions --- */

/**
 * Report what would have been added. 
 * @param {object} product The product being added.
 */
function addProductToCart(product) {
  cartCount++;
  renderCartCount();
  alert(`Added to cart\n\nProduct id: ${product.id}\nTitle: ${product.title}`);
}

 
/* --- Event handling --- */

/**
 * One delegated listener serves every card in the grid.
 * @param {MouseEvent} e A click inside the results grid.
 */
function handleGridClick(e) {

  if (!e.target || !e.target.dataset || !e.target.dataset.action) {
    return;
  }

  const product = findProduct(Number(e.target.dataset.id));
  const action = e.target.dataset.action;

  if (product && action) {
    if (action === 'add_to_cart') {
      addProductToCart(product);
    }
  }
} 

/* --- Main  --- */

/** Entry point: wire the listeners, then fetch the catalogue and render the browse view once the data arrives. */
function main() {
  const grid = document.querySelector('#product_grid');

  renderCartCount();
  renderResultsStatus(0, 'Loading products...');
  
  grid.addEventListener('click', handleGridClick);

  const products = selectProducts(catalogue, CONFIG.productLimit);
 
  renderProducts(products, grid); 
  renderResultsStatus(products.length);
  renderCartCount();
 
}

// Wait for the DOM before touching it
document.addEventListener('DOMContentLoaded', main);
