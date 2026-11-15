/**
 * AG Store - Assignment 2
 *
 * The shopping cart: line items, persistence and money calculations.
 *
 * Only the product id and quantity are stored. Titles, prices and thumbnails
 * are looked up from the catalogue when the cart is displayed, so a saved
 * cart can never show a stale price.
 *
 * Reference:
 *   - Assignment 2 specification
 *   - https://shop.merch.google/ 
 *   - Fundamentals of Web Development, Chapters 8-10
 *     - Ch 10 "Classes" - class / constructor / methods.
 *     - Ch 10 "Modules" - export, and module scope instead of globals.
 *     - Ch 10 "Web Storage API" - the cart survives a page reload.
 *
 * Author: Andre Gardiner
 */

// Shipping methods offered in the cart view, in display order. 
export const SHIPPING_METHODS = {
  standard: 'Standard',
  express: 'Express',
  priority: 'Priority'
};

// Shipping destinations offered in the cart view, in display order. 
export const DESTINATIONS = {
  canada: 'Canada',
  usa: 'United States',
  mexico: 'Mexico',
  international: 'International'
};

// Sales tax rate, charged on Canadian destinations only.
export const CANADIAN_TAX_RATE = 0.05;

// ShoppingCart class manages the cart lines, persistence, and calculations.
export class ShoppingCart {

  // Initializes the shopping cart with optional lines and an empty listener list.
  constructor(lines) {
    this.lines = lines ? lines : [];
    this.listeners = [];
  }

  /**
  * Adds a product, increasing the quantity when it is already in the cart. 
  */
  add(productId, quantity) {
    const amount = this.normalise(quantity === undefined ? 1 : quantity);

    let existing;

    // Look for an existing line with the same product ID.
    for (const line of this.lines) {
      if (line.id === productId) {
        existing = line;
        break;
      }
    }

    if (existing) {
      existing.quantity = existing.quantity + amount;
    } else {
      this.lines.push({ id: productId, quantity: amount });
    }
    this.save();
  }

  /**
   * Removes one product from the cart entirely.
   */
  remove(productId) {
    // Iterate backwards through the lines to safely remove the matching product.
    for (let i = this.lines.length - 1; i >= 0; i--) {
      if (this.lines[i].id === productId) {
        this.lines.splice(i, 1);
      }
    }
    this.save();
  }

  /**
   * Saves the cart to local storage.
   */
  save() {
    localStorage.setItem('shoppingCart', JSON.stringify(this.lines));
    console.log('Cart saved' + JSON.stringify(this.lines));

  }

  /**
   * Loads the cart from local storage.
   */
  load() {
    let data = localStorage.getItem('shoppingCart');
    this.lines = data ? JSON.parse(data) : [];
  }

  /**
   * Normalises a quantity to a positive integer. 
   */
  normalise(value) {
    let quantity = parseInt(value);
    if (isNaN(quantity) || quantity < 1) {
      return 1;
    }
    return quantity;
  }

  /**
   * Checks if the cart is empty.
   */
  isEmpty() {
    return this.lines.length === 0;
  }

  /**
   * Empties the cart, used by checkout.
   */
  clear() {
    this.lines = [];
    this.save();
  }


  /**
   * Returns the line items for the cart, combining saved lines with current product data.
   * Lines whose product is no longer in the catalogue are ignored.
   */
  lineItems(catalogue) {
    const items = [];

    // Iterate over the saved lines and match them with the catalogue products.
    for (let line of this.lines) {
      const product = catalogue.byId(line.id);
      if (product) {
        items.push({
          product: product,
          quantity: line.quantity,
          subtotal: product.price * line.quantity
        });
      }
    }
    return items;
  }

  /**
   * Calculates the total cost of merchandise in the cart.
   * 
   */
  merchandiseTotal(catalogue) {
    let total = 0;

    for (let item of this.lineItems(catalogue)) {
      total += item.subtotal;
    }
    return total;
  }

  /**
   * Returns the flat shipping rate for the given method and destination.
   * 
   */
  shippingRate(method, destination) {
    const rates = { canada: 10, usa: 15, mexico: 15, international: 30 };

    if (rates === undefined) {
      return 0;
    }

    let rate = rates[destination];

    if (rate === undefined) {
      return 0;
    }
    return rate;
  }

  /**
   * Calculates the totals for the cart, including merchandise, shipping, tax, and overall total.
   *
  */
  totals(catalogue, method, destination) {

    let merchandise = this.merchandiseTotal(catalogue);

    let empty = this.isEmpty();

    let rate = this.shippingRate(method, destination);

    let shipping = empty ? 0 : rate; // conditional (ternary) operator.

    let taxed = destination === DESTINATIONS.CANADA;

    let tax = taxed ? merchandise * CANADIAN_TAX_RATE : 0;

    return {
      merchandise: merchandise,
      shipping: shipping,
      tax: tax,
      total: merchandise + shipping + tax,
      freeShipping: false,
      taxed: taxed
    };
  }


}
