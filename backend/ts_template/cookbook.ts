import { getCookbook } from './devdonalds';
import { recipe, ingredient } from './devdonalds';

function addEntry(entry: any) {
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

function getSummary() {
	
	return {};
};

export {
  addEntry,
	getSummary,
};