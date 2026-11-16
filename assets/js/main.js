/**
 * AG Store - Assignment 2
 *
 * Application entry point.
 *
 * Loads the catalogue, restores the saved cart, registers the four views
 * with the view switcher and attaches the handful of page-wide listeners.
 *
 * Everything starts from a DOMContentLoaded listener. Chapter 9, 9.3.2: "a
 * problem can occur if your JavaScript tries to programmatically reference a
 * DOM element that has not yet been loaded ... Generally, this is the event
 * you want to use."
 *
 *
 * Reference:
 * - Assignment 2 specification
 * - https://shop.merch.google/ - styling and color reference.
 * - Fundamentals of Web Development, Chapters 8-10
 *     - Ch 10 "Classes" - class / constructor / methods.
 *     - Ch 10 "Modules" - import, and module scope instead of globals.
 *     - Ch 9 "Page Loading and the DOM" - DOMContentLoaded.
 *     - Ch 9 "Event Delegation" - one document listener opens and closes every modal panel.
 *     - Ch 9 "Using the Dataset Property" - data-dialog / data-close.
 *     - Ch 9 "Event Object" - event.target, used to tell a click on the panel's backdrop from a click inside the panel.
 *     - Ch 8 "Objects" - a plain object used as a lookup table, read with square-bracket notation (8.7.1).
 *     - Ch 8 "Callback Functions" - navigate() and addToCart() are passed into the views rather than imported by them.
 *     - Ch 8 "Hoisting" - navigate() is a function declaration, so the views may hold a reference to it before the router exists.
 *
 * Author: Andre Gardiner
 */

import { ShoppingCart } from './models/cart.js';
import { Product } from './models/product.js';
import { HomeView } from './views/home.js';
import { 
  Router,
  navigate 
} from './router.js';
import {
  el,
  readJson,
  hideViews,
  bindModalPanels,
  bindCartBadge
} from './helpers.js';


// import catalogue from '../data/data-minifed.json' with { type: 'json' };

// All products in one request, as specified by the assignment. https://dummyjson.com/products?limit=100
const API_URL = 'https://sirdre.github.io/products/assets/data/data-minifed.json';

// localStorage key holding the cached catalogue.
const STORAGE_KEY = 'ag_store_catalogue';


/** ---- Loading and error states ----  */

/**
 * Builds the panel shown while the catalogue loads, and again if it fails.
 */
function createStatusPanel() {
  const panel = el('section', 'status_panel');
  panel.appendChild(el('p', 'status_message'));
  panel.appendChild(el('p', 'status_detail'));
  return panel;
}


/** ---- Loading ----  */
  
/**
 * Loads the product catalogue from the API.
 */
async function loadCatalogue() {

  const response = await fetch(API_URL); // Fetch the product data from the API

  if (!response.ok) {
    throw new Error('The product API responded with ' + response.status + ' ' + response.statusText + '.');
  }

  const payload = await response.json();
  const products = Array.isArray(payload.products) ? payload.products : [];

  if (products.length === 0) {
    throw new Error('The product API returned no products.');
  }

  // writeJson(STORAGE_KEY, { savedAt: new Date().getTime(), products: products });
  console.log('Fetched products from API.' + products.length + ' products.');

  return new Product(products, false);
}

/**
 * Loads the shopping cart from localStorage. Returns an empty cart if nothing was saved.
 */
async function loadCart() {

  const stored = await readJson(STORAGE_KEY);

  if (!Array.isArray(stored)) {
    return new ShoppingCart([]);
  }

  const lines = [];

  // Clean the stored lines, keeping only well-formed entries.
  for (const line of stored) {
    
    const id = line && (line.id) ? parseInt(line.id) : null;

    if (id !== null && id !== false) {
      lines.push({ id, quantity: parseInt(line.quantity) });
    }
  }

  console.log('Loaded cart from localStorage with ' + lines.length + ' items.');

  return new ShoppingCart(lines);
}

/**
 * Entry point for the application. Initializes the views, router, and shopping cart.
 */
async function main() {
  
  hideViews();

  const main = document.querySelector('main');
  const panel = createStatusPanel();

  // Add the status panel to the main content area.
  main.appendChild(panel);


  try {
    const catalogue = await loadCatalogue();
    panel.parentNode.removeChild(panel);

    // Hand over to the main application bootstrap function.
    const cart = await loadCart();

    /* Adding to the cart happens from three places (the browse grid, the home
      strip and the related strip), so it is written once here and passed in. */
    const addToCart = (product) => {
      cart.add(product.id, 1);
      console.log(`Added ${product.title} to your cart.`);
    };

    /* The registry maps a view name to the container to show and the object
      that fills it. Adding a fifth view would mean one more entry here. */
    router = new Router({
      home: new HomeView(catalogue, cart, navigate, addToCart),
    });

    bindModalPanels();
    bindCartBadge(cart);

    /* Requirement 3: the home view is the one shown first. */
    router.start('home');

    console.log('Application loaded successfully.' + ' Router started with view: ' + router.currentName);

  } catch (error) {
    console.error('Could not load the product catalogue.', error);
    panel.parentNode.removeChild(panel);

  }
}

// Wait for the DOM to be fully loaded before running the main function.
document.addEventListener('DOMContentLoaded', main);
