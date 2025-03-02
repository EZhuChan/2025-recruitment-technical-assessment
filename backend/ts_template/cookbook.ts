import { getCookbook } from './devdonalds';
import { recipe, ingredient, ingredInfo, summary } from './devdonalds';

/**
 * Add an entry to the cookbook
 * 
 * @param {string} entry - a cookbook entry
 * @returns {} - Entry added successfully
 */
const addEntry = (entry: any): {} => {
	const cookbook = getCookbook();

	if (entry.type != "recipe" && entry.type != "ingredient") {
		throw new Error('Not a valid entry type');
	}

	const inCookbook = cookbook.some(
      (item: recipe | ingredient) => item.name === entry.name);
	if (inCookbook) {
		throw new Error(`${entry.name} is already in the cookbook`);
	}

	if (entry.type == "recipe") {
		const requiredItemNames = entry.requiredItems.map((item: recipe) => item.name);
		const uniqNames = new Set(requiredItemNames);

		if (uniqNames.size != requiredItemNames.length) {
			throw new Error(`Multiple instances of a required item`);
		}
	} else if (entry.cookTime < 0) {
		throw new Error('Cooking time must be >= 0');
	}

	cookbook.push(entry);

	return {};
};

/**
 * Returns a summary of a given recipe including total cooktime and all necessary
 * ingredients
 * 
 * @param {string} name - the name of the recipe or ingredient
 * @returns {summary} - Recipe Summary
 */
const getSummary = (name: string): summary => {
  const cookbook = getCookbook();
	const recipe = cookbook.find((item: recipe | ingredient) => item.name === name);

  if (!recipe) throw new Error(`${name} not in cookbook`);

  if (recipe.type === "ingredient") {
    throw new Error(`${name} is not a recipe`);
  }

  const ingredients = sumIngredients(recipe, 1);

	return {
    name,
    cookTime: ingredients.reduce(
        (items, item) => items + item.quantity * item.cookTime, 0),
    ingredients: ingredients.map((ingredient) =>  {
                  return {
                    name: ingredient.name,
                    quantity: ingredient.quantity,
                  }}),
    };
};

/**
 * 
 * @param {recipe} recipe - A given recipe
 * @param {number} quantity - How many instances of a recipe is needed
 * 
 * @returns {ingredInfo[]} - Culmination of all ingredients needed
 */

const sumIngredients = (recipe: recipe, quantity: number): ingredInfo[] => {
  const cookbook = JSON.parse(JSON.stringify(getCookbook()));
  const ingredients = [];

  for (const item of recipe.requiredItems) {
    const itemInfo = cookbook
          .find((it: recipe | ingredient) => it.name === item.name);

    if (!itemInfo) {
      throw new Error(`A required item is not in the cookbook`);
    }

    if (itemInfo.type === "recipe") {
      const items = sumIngredients(itemInfo, item.quantity);

      items.forEach((newItem) => inIngredients(ingredients, newItem, quantity));
    } else {
      delete itemInfo.type;
      itemInfo.quantity = item.quantity;
      inIngredients(ingredients, itemInfo, quantity);
    }
  }

  return ingredients;
}

/**
 * 
 * @param {ingredInfo[]} ingredients - List of ingredients
 * @param {ingredInfo} item - Ingredient to be added
 * @param {number} quantity - How many instances are needed
 * 
 * @returns
 */
const inIngredients = (ingredients: ingredInfo[], item: ingredInfo, quantity: number) => {
  const index = ingredients
        .findIndex((ingredient: ingredInfo) => item.name === ingredient.name)

  item.quantity *= quantity
  index != -1 ? ingredients[index].quantity += item.quantity : ingredients.push(item);

  return;
}

export {
  addEntry,
	getSummary,
};