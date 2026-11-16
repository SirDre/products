/**
 * AG Store - Assignment 2
 *
 * Shopping cart view: line items, shipping options, totals and checkout.
 *
 * All of the money arithmetic lives in the ShoppingCart model; this file is
 * only responsible for putting those numbers on screen and for reacting to
 * the controls.
 *
 * Reference:
 * - Assignment 2 specification
 * - https://shop.merch.google/ - styling and color reference.
 * - Fundamentals of Web Development, Chapters 8-10
 *     - Ch 10 "Classes" - class / constructor / methods.
 *     - Ch 10 "Modules" - export, and module scope instead of globals.
 *     - Ch 9  "Templates" - each row is a clone of a <template>.
 *
 * Author: Andre Gardiner
 */

import {
  cloneTemplate,
  emptyElement,
  formatPrice,
  formatTitle,
  setImage
} from '../helpers.js';

// Cart view class for the AG Store. Handles rendering the shopping cart, line items, shipping options, and checkout.
export class CartView {

  constructor(catalogue, cart, navigate) {
    this.catalogue = catalogue;
    this.cart = cart;
    this.navigate = navigate;
    this.isBuilt = false;

    // The main container element for the cart view.
    this.element = document.querySelector('#cart');
    this.rowsBody = document.querySelector('#cart_rows');
    this.table = document.querySelector('#cart_table');
    this.emptyMessage = document.querySelector('#cart_empty_message');
    this.summaryLine = document.querySelector('#cart_summary_line');
    this.methodSelect = document.querySelector('#shipping_method');
    this.destinationSelect = document.querySelector('#shipping_destination');
    this.checkoutButton = document.querySelector('#checkout_button');
    this.shippingNote = document.querySelector('#shipping_note');
  }

  /**
   * Draws the whole view.
   */
  render() {
    if (!this.isBuilt) {
      this.build();
      this.isBuilt = true;
    }
    this.renderRows();
    this.renderSummary();
  }

  /**
   * Attaches the listeners that belong to the page furniture. The rows attach
   * their own listeners in createRow(), because they are rebuilt whenever the
   * cart changes.
   */
  build() {
    for (let select of [this.methodSelect, this.destinationSelect]) {
      select.addEventListener('change', () => this.renderSummary());
    }

    this.checkoutButton.addEventListener('click', () => this.checkout());
  }


  /** ---- actions ----  */


  /**
   * Applies a new quantity. Only the affected row and the summary are
   * redrawn, so the box the user is typing in keeps the focus.
   */
  changeQuantity(row, item, input) {
    // Parse the input value as an integer and ensure it is at least 1.
    let quantity = parseInt(input.value);
    if (isNaN(quantity) || quantity < 1) {
      quantity = 1;
    }
    // Update the input box with the corrected quantity.
    this.cart.setQuantity(item.product.id, quantity);

    row.querySelector('.cart_col_subtotal').textContent = formatPrice(item.product.price * quantity);

    this.renderSummary();
  }

  /**
   * Confirms the order, empties the cart and returns to the home view.
   */
  checkout() {
    if (this.cart.isEmpty()) {
      return;
    }
    let totals = this.cart.totals(
      this.catalogue,
      this.methodSelect.value,
      this.destinationSelect.value
    );

    this.cart.clear();
    this.render();

    console.log(`Thank you! Your order of ${formatPrice(totals.total)} is on its way.`);
    
    this.navigate('home');
  }


  /** ---- rendering ----  */

  /**
   * Builds one table row per line item, or shows the empty-cart message.
   */
  renderRows() {
    let items = this.cart.lineItems(this.catalogue);
    let isEmpty = items.length === 0;

    emptyElement(this.rowsBody); // Clear the existing rows before rendering new ones.

    // Create a row for each line item and append it to the table body.   
    items.forEach((item) => {
      this.rowsBody.appendChild(this.createRow(item));
    });

    if (isEmpty) {
      this.table.classList.add('hidden');
      this.emptyMessage.classList.remove('hidden');
    } else {
      this.table.classList.remove('hidden');
      this.emptyMessage.classList.add('hidden');
    }
    this.setControlsEnabled(!isEmpty);
  }

  /**
   * Creates a table row for one line item.
   */
  createRow(item) {
    let row = cloneTemplate('cart_row_template', '.cart_row');
    let imageLink = row.querySelector('.cart_item_link');
    let titleLink = row.querySelector('.cart_item_title');
    let quantity = row.querySelector('.cart_quantity');
    let removeButton = row.querySelector('.cart_remove');

    // the row records which product it shows.
    row.dataset.id = item.product.id;

    // Set the product title with a link to the product page.
    titleLink.textContent = item.product.title;

    // Set the product image with a link to the product page.
    setImage(row.querySelector('.cart_item_image'), item.product.thumbnail, item.product.title, imageLink);

    // Set the category, price, and subtotal for the row.
    row.querySelector('.cart_item_category').textContent = formatTitle(item.product.category);
    row.querySelector('.cart_col_price').textContent = formatPrice(item.product.price);
    row.querySelector('.cart_col_subtotal').textContent = formatPrice(item.subtotal);

    // Both the picture and the title open the product. A click on the <img>
    const openProduct = (event) => {
      event.preventDefault();
      this.navigate('product', item.product.id);
    };

    // Set up the remove button with an accessible label and click handler.
    imageLink.addEventListener('click', openProduct);
    titleLink.addEventListener('click', openProduct);

    // Set up the quantity input with an accessible label and change handler.
    quantity.value = item.quantity;
    quantity.setAttribute('aria-label', `Quantity of ${item.product.title}`);
    quantity.addEventListener('input', () => this.changeQuantity(row, item, quantity));

    // Set up the remove button with an accessible label and click handler.
    removeButton.setAttribute('aria-label', `Remove ${item.product.title} from cart`);
    removeButton.addEventListener('click', () => {
      this.cart.remove(item.product.id);
      this.render();
      console.log(`Removed ${item.product.title} from your cart.`);
    });

    console.log(`Rendered cart row for product: ${item.product.title}`);
    
    return row;
  }

  /**
   * Recalculates the item count, merchandise, shipping, tax and total.
   * Called both after a full redraw and after a single quantity change, so
   * every figure on the page is updated by exactly one function.
   */
  renderSummary() {
    let count = this.cart.count();

    // Update the summary line with the item count.
    this.summaryLine.textContent = (count === 0) ? '' : `${count} ${count === 1 ? 'item' : 'items'}`;

    let totals = this.cart.totals(
      this.catalogue,
      this.methodSelect.value,
      this.destinationSelect.value
    );

    // Update the summary section with the calculated totals.
    document.querySelector('#summary_merchandise').textContent = formatPrice(totals.merchandise);
    document.querySelector('#summary_shipping').textContent = !this.cart.isEmpty() ? 'Free' : formatPrice(totals.shipping);
    document.querySelector('#summary_tax').textContent = formatPrice(totals.tax);
    document.querySelector('#summary_total').textContent = formatPrice(totals.total);
    
    // Update the tax label based on whether tax is applied.
    document.querySelector('#summary_tax_label').textContent =  totals.taxed ? 'Tax (5%)' : 'Tax (not charged)';

    // Update the shipping note based on whether free shipping is applied.
    this.shippingNote.textContent = !this.cart.isEmpty() ? 'Your order ships free.' : `Orders over $50 ship free.`;
    console.log(`Rendered cart summary.`);
  }

  /**
   * Shipping options and checkout are unusable while the cart is empty.
   * "select.disabled = true".
   */
  setControlsEnabled(enabled) {
    this.methodSelect.disabled = !enabled;
    this.destinationSelect.disabled = !enabled;
    this.checkoutButton.disabled = !enabled;
  }
}
