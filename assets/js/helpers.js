/**
 * AG Store - Assignment 2
 *
 * Helper functions for user-interface.
 *
 * Everything in here is used by more than one view: product cards, element creation, formatting, images, and modal panels.
 *
 *
 * Reference:
 * - Assignment 2 specification
 * - https://shop.merch.google/ - styling and color reference.
 * - Fundamentals of Web Development, Chapters 8-10
 *     - Ch 9, "DOM Manipulation Methods" (Table 9.5) - createElement(), appendChild(), removeChild(), setAttribute().
 *
 * Author: Andre Gardiner
 */

/**
 * Month labels used by formatDate(). 
 */
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

/** ---- Reading JSON from localStorage ----  */

/**
 * Reads a JSON value from localStorage.
 */
export function readJson(key) {
  try {

    // Ch 10: getItem() returns null when the key is not present.
    let raw = window.localStorage.getItem(key);
    if (raw === null) {
      return null;
    }
    // Parse the JSON string into an object.
    return JSON.parse(raw);

  } catch (error) {
    console.warn('Could not read "' + key + '" from localStorage.', error);
    return null;
  }
}

 

/** ---- Sorting ----  */

/**
 * Compares two strings for alphabetical order, case-insensitive.
 * 
 */
export function compareText(a, b) {
  const first = ('' + a).toLowerCase();
  const second = ('' + b).toLowerCase();
  if (first < second) {
    return -1;
  }
  if (first > second) {
    return 1;
  }
  return 0;
}

/**
 * Sorts a copy of an array of products, so the caller's array is left alone.
 *
 * This is a plain module function rather than a method of Catalogue, because
 * static functions are among the class features (Ch 10, 10.2.2 "Classes").
 */
export function sortProducts(products, order) {
  const compare = order === 'name' ? compareText : compareText; // Default to compareText for now, can extend for other sort orders

  /* Ch 8 "spread syntax ... provides a new way to create an array from one or more existing arrays", used here to copy before sorting. */
  const sorted = [...products];

  // Insertion sort is used below to order the products according to the compare function.
  for (let i = 1; i < sorted.length; i += 1) {
    const product = sorted[i];
    let position = i - 1;
    while (position >= 0 && compare(sorted[position], product) > 0) {
      sorted[position + 1] = sorted[position];
      position -= 1;
    }
    sorted[position + 1] = product;
  }
  return sorted;
}


/** ---- Elements ----  */


/**
 * Creates an element without building markup from strings. 
 */
export function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) {
    node.className = className;
  }
  if (text !== undefined) {
    node.textContent = text;
  }
  return node;
}

/**
 * Clones a template and returns the root element inside it. 
 */
export function cloneTemplate(templateId, selector) {
  const template = document.getElementById(templateId);
  const clone = template.content.cloneNode(true);
  return clone.querySelector(selector);
}

/**
 * Empties an element of all its children.
 */
export function emptyElement(node) {
  while (node.firstChild) {
    node.removeChild(node.firstChild);
  }
}


/** ---- Formatting ----  */

/**
 * Formats a numeric amount as a price string, e.g. "$9.99". 
 */
export function formatPrice(amount) {
  let value = parseFloat(amount);
  if (isNaN(value)) {
    return '$0.00';
  }
  return '$' + value.toFixed(2);
}

/**
 * Formats a date string into a human-readable date, e.g. "January 1, 2024". 
 */
export function formatDate(dateString) {
  let date = new Date(dateString);

  if (isNaN(date.getTime())) {
    return '';
  }

  return MONTH_NAMES[date.getMonth()] + ' ' + date.getDate() + ', ' + date.getFullYear();
}

/**
 * Formats a string as a title, replacing hyphens with spaces and capitalizing the first letter.
 */
export function formatTitle(value) {
 
  const spaced = value.split('-').join(' '); // Replace hyphens with spaces for display
  if (spaced.length === 0) {
    return '';
  }
  // Capitalize the first character for display.
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}


/**
 * Creates a star rating element with optional numeric rating.
 */
export function starsElement(rating, number) {
  let value = parseFloat(rating);
  let filled = parseInt(value);
  let wrapper = el('span', 'stars');

  // Accessibility label for screen readers
  wrapper.setAttribute('aria-label', value.toFixed(1) + ' out of 5 stars');

  // Loop through each star position to build the star elements.
  for (let star = 1; star <= 5; star++) {
    const className = star <= filled ? 'star star_on' : 'star';
    wrapper.appendChild(el('span', className, '★'));
  }

  if (number) {
    wrapper.appendChild(el('span', 'stars_number', value.toFixed(1)));
  }

  return wrapper;
}


/** ---- Images ----  */


/**
 * Sets the source and alt text for an image, and marks a placeholder if loading fails.
 */
export function setImage(image, source, alt, placeholderTarget) {
  let target = placeholderTarget;

  if (!target) {
    target = image.parentNode;
  }

  /* Ch 9, Table 9.4 - the src and alt properties of an <img> element. */
  image.src = source ? source : '';
  image.alt = alt;
  image.addEventListener('error', function () {
    if (target) {
      target.classList.add('no_image');
    }
  });

}


/** ---- Product Grid ----  */

/**
 * Renders a grid of product cards into the specified container element.
 */
export function renderProductGrid(gridElement, products, onView, onAddToCart) {
  const templateElement = document.querySelector('#product_card_template');
  
  
  if (!templateElement) {
    console.error('Product card template not found');
    return;
  }
  
  const template = templateElement.content.querySelector('.card');
  
  // Clear existing products
  emptyElement(gridElement);
  
  // Render each product card
  for (let product of products) {
    let card = template.cloneNode(true);
    let imageLink = card.querySelector('.card_image_link');
    let image = card.querySelector('.card_image');
    let titleLink = card.querySelector('.card_title_link');
    let title = card.querySelector('.card_title');
    let rating = card.querySelector('.card_rating');
    let price = card.querySelector('.card_price');
    let viewButton = card.querySelector('.card_view');
    let addButton = card.querySelector('.card_add');
    
    // Set product image
    setImage(image, product.thumbnail, product.title, card);
    
    // Set title
    title.textContent = product.title;
    titleLink.href = '#';
    titleLink.addEventListener('click', (e) => {
      e.preventDefault();
      onView(product);
    });
    
    imageLink.href = '#';
    imageLink.addEventListener('click', (e) => {
      e.preventDefault();
      onView(product);
    });
    
    // Set rating
    rating.appendChild(starsElement(product.rating, true));
    
    // Set price
    price.textContent = formatPrice(product.price);
    
    // Set view button
    viewButton.href = '#';
    viewButton.addEventListener('click', (e) => {
      e.preventDefault();
      onView(product);
    });
    
    // Set add to cart button
    addButton.addEventListener('click', () => {
      onAddToCart(product);
    });
    
    gridElement.appendChild(card);
  }
}


/** ---- Modal panels ----  */

/**
 * Shows a modal panel. 
 */
export function openModal(id) {
  document.getElementById(id).classList.remove('hidden');
}

/**
 * Hides a modal panel. 
 */
export function closeModal(id) {
  document.getElementById(id).classList.add('hidden');
}

/**
 * Binds modal panel opening and closing to all data-dialog and data-close buttons on the page, as well as backdrop clicks.
 */
export function bindModalPanels() {
  // Open modal when data-dialog button is clicked
  document.addEventListener('click', (e) => {
    const dialogId = e.target.dataset.dialog;
    if (dialogId) {
      openModal(dialogId);
    }
  });

  // Close modal when data-close button is clicked
  document.addEventListener('click', (e) => {
    const closeId = e.target.dataset.close;
    if (closeId) {
      closeModal(closeId);
    }
  });

  // Close modal when clicking on the backdrop (outside the panel)
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
      const modalId = e.target.id;
      if (modalId) {
        closeModal(modalId);
      }
    }
  });
}

/**
 * Binds the cart badge to the provided shopping cart, updating it whenever the cart changes.
 */
export function bindCartBadge(cart) {
  const badge = document.getElementById('cart_count');
  
  if (!badge) {
    return;
  }

  // Update the badge with the current cart line count
  badge.textContent = cart.lines.length; 
}

/**
 * Hides all views by adding the 'hidden' class.
 * Used during initialization to ensure all views start hidden until the router shows the appropriate one.
 */
export function hideViews() {
  const views = document.querySelectorAll('.view');
  for (let view of views) {
    view.classList.add('hidden');
  }
}
