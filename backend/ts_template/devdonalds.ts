import express, { Request, Response } from "express";
import { addEntry, getSummary } from "./cookbook";

// ==== Type Definitions, feel free to add or modify ==========================
interface cookbookEntry {
  name: string;
  type: string;
}

interface requiredItem {
  name: string;
  quantity: number;
}

export interface recipe extends cookbookEntry {
  requiredItems: requiredItem[];
}

export interface ingredient extends cookbookEntry {
  cookTime: number;
}

// =============================================================================
// ==== HTTP Endpoint Stubs ====================================================
// =============================================================================
const app = express();
app.use(express.json());

// Store your recipes here!
const cookbook: any = [];

// Task 1 helper (don't touch)
app.post("/parse", (req:Request, res:Response) => {
  const { input } = req.body;

  const parsed_string = parse_handwriting(input)
  if (parsed_string == null) {
    res.status(400).send("this string is cooked");
    return;
  } 
  res.json({ msg: parsed_string });
  return;
  
});

// [TASK 1] ====================================================================
// Takes in a recipeName and returns it in a form that 
const parse_handwriting = (recipeName: string): string | null => {
  const connectors = /[-_]/g;
  const nonLetters = /[^A-Za-z\s-_]/g;
  const spaces = /\s+/g;

  recipeName = recipeName.replace(nonLetters, '')
                          .replace(connectors, ' ')
                          .replace(spaces, ' ')
                          .trim()
                          .toLowerCase().split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
  
  console.log(recipeName);

  if (recipeName.length === 0) return null;
  
  return recipeName;
}

// [TASK 2] ====================================================================
// Endpoint that adds a CookbookEntry to your magical cookbook
app.post("/entry", (req:Request, res:Response) => {
  const entry = req.body;
  console.log(entry);

  try {
    const result = addEntry(entry);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: error.msg });
  }

});

export function getCookbook() {
  return cookbook;
}

// [TASK 3] ====================================================================
// Endpoint that returns a summary of a recipe that corresponds to a query name
app.get("/summary", (req:Request, res:Request) => {
  try {
    const result = getSummary();
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json();
  }
  
  // res.status(500).send("not yet implemented!")
});

// =============================================================================
// ==== DO NOT TOUCH ===========================================================
// =============================================================================
const port = 8080;
app.listen(port, () => {
  console.log(`Running on: http://127.0.0.1:8080`);
});
