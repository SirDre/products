/**
 * AG Store - Assignment 2
 *
 * The product catalogue: loading, caching, filtering and sorting.
 *
 * The catalogue supports loading, caching, filtering, and sorting of products.
 * It provides methods to query products by ID, category, rating, and price range.
 *
 * Reference:
 * - Assignment 2 specification
 * - https://shop.merch.google/ 
 * - Fundamentals of Web Development, Chapters 8-10
 *     - Ch 10 "Classes" - class / constructor / methods.
 *     - Ch 10 "Modules" - export, and module scope instead of globals.
 *     - Ch 8 "Objects" - a plain object used as a lookup table, read with square-bracket notation (8.7.1).
 *     - Ch 8 "Arrays" - push(), indexOf(), slice(), length, spread syntax.
 *
 * Author: Andre Gardiner
 */

// The default sort order for the catalogue.
export const DEFAULT_SORT = 'name';


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
  const compare =  order === 'name' ? compareText : compareText; // Default to compareText for now, can extend for other sort orders

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

// Product class represents a collection of products and provides utility methods for browsing and querying them.
export class Product {

    constructor(products) {
        this.products = products; // Store the full product list
    }

    /**
     * Finds a product by its id.
     */
    byId(id) {
        for (let product of this.products) {
            if (product.id === id) {
                return product;
            }
        }
    }

    /**
     * Returns the list of unique category names, sorted alphabetically.
     */
    categories() {
        let names = [];

        // Collect unique category names.
        for (let product of this.products) {
            if (names.indexOf(product.category) === -1) {
                names.push(product.category);
            }
        }

        // Sort the names alphabetically using a simple bubble sort.
        for (let i = 0; i < names.length; i++) {
            for (let j = i + 1; j < names.length; j++) {
                if (compareText(names[i], names[j]) > 0) {
                    let current = names[i];
                    names[i] = names[j];
                    names[j] = current;
                }
            }
        }
        return names;
    }

    /**
     * Checks if the product belongs to one of the selected categories.
     */
    matchesCategory(product, categories) {
        return categories.length === 0 || categories.indexOf(product.category) !== -1;
    }

    /**
     * Checks if the product's rating matches one of the selected whole star ratings.
     */
    matchesRating(product, ratings) {
        return ratings.length === 0 || ratings.indexOf(wholeStars(product.rating)) !== -1;
    }

    /**
     * Checks if the product's price falls within the specified bounds.
     */
    matchesPrice(product, over, under) {
        if (over !== null && product.price <= over) {
            return false;
        }
        if (under !== null && product.price >= under) {
            return false;
        }
        return true;
    }

    /**
     * Checks if the product's title matches the search pattern.
     */
    matchesName(product, matcher) {
        if (matcher === null) {
            return true;
        }
        return product.title.toLowerCase().indexOf(matcher) !== -1; // Case-insensitive match.
    }

    /**
     * Filters the products based on the specified criteria.
     * 
     * Example: "Beauty or Fragrances, under $20" should match products in either the Beauty or Fragrances category that are priced under $20.
     */
    filter(criteria) {

        const matches = []; // Initialize the array to hold matching products.

        const matcher = (criteria.name || '').toLowerCase(); // Convert the search term to lowercase for case-insensitive matching.

        // Iterate over all products and apply the filter criteria.
        for (const product of this.products) {
            if (this.matchesName(product, matcher)
                && this.matchesCategory(product, criteria.categories)
                && this.matchesRating(product, criteria.ratings)
                && this.matchesPrice(product, criteria.priceOver, criteria.priceUnder)) {

                matches.push(product); // Add the product to the matches array if it meets all criteria.
            }
        }
        return matches;
    }


}
