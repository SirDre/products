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
