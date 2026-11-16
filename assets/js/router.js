/**
 * AG Store - Assignment 2
 *
 * The view switcher ("router") for this single-page application.
 *
 *
 * Reference:
 * - Assignment 2 specification
 * - https://shop.merch.google/ - styling and color reference.
 * - Fundamentals of Web Development, Chapters 8-10
 *     - Ch 10 "Classes" - class / constructor / methods.
 *     - Ch 9 "Event Delegation" - one listener for many elements. 
 *
 * Author: Andre Gardiner
 */

// Shown when no view name is given, or an unknown one is.
const DEFAULT_VIEW = 'home';

/**
 * The router instance used for navigation between views.
 */
const ROUTER = null;

/**
 * Navigates to a different view using the router.
 */
export function navigate(view, param) {
  if (ROUTER) {
    ROUTER.show(view, param);
  }
}

// The Router class manages view switching and navigation link highlighting.
export class Router {
 
  constructor(views) {
    this.views = views;
    this.currentName = null;
  }

  /**
   * Registers the one navigation listener and displays the opening view.
   */
  start(name) {
    this.bindNavigationLinks();
    this.show(name ? name : DEFAULT_VIEW);
  }

  /**
   * Finds the closest ancestor element that is a navigation link, if any.
   */
  bindNavigationLinks() {
    document.addEventListener('click', (event) => {
      const link = this.findNavigationLink(event.target);
      if (link) {
   
        event.preventDefault(); // Stop the browser from following the link.

        this.show(link.dataset.view, link.dataset.param);
      }
    });
  }

  /**
   * Shows the requested view and hides all others.
   */
  show(name, param) {
    
    // Decide which view to show: if the requested one exists, use it; otherwise, fall back to the default view.
    const wanted = this.views[name] ? name : DEFAULT_VIEW;
    
    const view = this.views[wanted]; // The view object corresponding to the requested view.

    // Hide all views except the one requested.
    for (let registeredName in this.views) {
      const element = this.views[registeredName].element;
      
      if (registeredName === wanted) {
        element.classList.remove('hidden');
      } else {
        element.classList.add('hidden');
      }
    }

    this.currentName = wanted;
    this.markActiveLinks(wanted);
    view.render(param);

    console.log(`Showing view: ${wanted}`);
  
  }

  /**
   * Finds the closest ancestor element that is a navigation link, if any.
   */
  findNavigationLink(clicked) {

    const parent = clicked.parentNode;
    
    if (clicked.dataset.view) {
      return clicked;
    }
    if (parent && parent.dataset && parent.dataset.view) {
      return parent;
    }
    return null;
  }

  /**
   * Highlights the navigation link corresponding to the active view.
   */
  markActiveLinks(name) {
 
    // Find all navigation links and highlight the one matching the active view.
    const links = document.querySelectorAll('[data-nav]');
    
    for (let link of links) {
      if (link.dataset.nav === name) {
        link.classList.add('is_active');
      } else {
        link.classList.remove('is_active');
      }
    }
  }
}
