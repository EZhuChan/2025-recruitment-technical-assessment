import { getCookbook } from './devdonalds';
import { recipe, ingredient, ingredientInfo } from './devdonalds';

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

	const inCookbook = cookbook.some((item: recipe | ingredient) => item.name === entry.name);
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
 * 
 * @param {string} name - the name of recipe or ingredient
 * @returns
 */
const getSummary = (name: string) => {
  const cookbook = getCookbook();
	const recipe = cookbook.find((item: recipe | ingredient) => item.name === name);

  if (!recipe) throw new Error(`${name} not in cookbook`);

  if (recipe.type === "ingredient") {
    throw new Error(`${name} is not a recipe`);
  }

  const ingredients = sumIngredients(recipe);

	return {
    name,
    cookTime: 0,
    ingredients: ingredients.map((ingredient) =>  {

                  })
  };
};

/**
 * 
 * @param recipe 
 * @returns [{
 *  name:
 *  quantity:
 *  cooktime: 
 * }]
 */

const sumIngredients = (recipe: recipe) => {
  const cookbook = getCookbook();
  const ingredients = [];

  for (const item of recipe.requiredItems) {
    const itemInfo = cookbook
          .find((item: recipe | ingredient) => item.name === item.name);

    if (!itemInfo) {
      throw new Error(`A required item is not in the cookbook`);
    }
    itemInfo.quantity = item.quantity;

    if (itemInfo.type === "recipe") {
      const items = sumIngredients(itemInfo.name);

      items.forEach((newItem) => inIngredients(ingredients, newItem));
    }

    inIngredients(ingredients, itemInfo);
  }

  return ingredients;
}

const inIngredients = (ingredients: ingredientInfo[], item: ingredientInfo) => {
  const index = ingredients
        .findIndex((ingredient: ingredientInfo) => item.name === ingredient.name)

  index ? ingredients[index].quantity++ : ingredients.push(item);
  return;
}

export {
  addEntry,
	getSummary,
};