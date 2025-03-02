const request = require("supertest");

describe("Task 1", () => {
  describe("POST /parse", () => {
    const getTask1 = async (inputStr) => {
      return await request("http://localhost:8080")
        .post("/parse")
        .send({ input: inputStr });
    };

    it("example1", async () => {
      const response = await getTask1("Riz@z RISO00tto!");
      expect(response.body).toStrictEqual({ msg: "Rizz Risotto" });
    });

    it("example2", async () => {
      const response = await getTask1("alpHa-alFRedo");
      expect(response.body).toStrictEqual({ msg: "Alpha Alfredo" });
    });

    it("error case", async () => {
      const response = await getTask1("");
      expect(response.status).toBe(400);
    });

    it("example3", async () => {
      const response = await getTask1("Riz@z             RISO00tto     bes    !");
      expect(response.body).toStrictEqual({ msg: "Rizz Risotto Bes" });
    });

    it("example4", async () => {
      const response = await getTask1("Riz@z      *      RISO00tto     bes    !");
      expect(response.body).toStrictEqual({ msg: "Rizz Risotto Bes" });
    });

    it("example5", async () => {
      const response = await getTask1("alpHa-alFR _edo");
      expect(response.body).toStrictEqual({ msg: "Alpha Alfr Edo" });
    });

    it("example6", async () => {
      const response = await getTask1("   alpHa-alFR _edo  ");
      expect(response.body).toStrictEqual({ msg: "Alpha Alfr Edo" });
    });
  });
});

describe("Task 2", () => {
  describe("POST /entry", () => {
    const putTask2 = async (data) => {
      return await request("http://localhost:8080").post("/entry").send(data);
    };

    it("Add Ingredients", async () => {
      const entries = [
        { type: "ingredient", name: "Egg", cookTime: 6 },
        { type: "ingredient", name: "Lettuce", cookTime: 1 },
      ];
      for (const entry of entries) {
        const resp = await putTask2(entry);
        expect(resp.status).toBe(200);
        expect(resp.body).toStrictEqual({});
      }
    });

    it("Add Recipe", async () => {
      const meatball = {
        type: "recipe",
        name: "Meatball",
        requiredItems: [{ name: "Beef", quantity: 1 }],
      };
      const resp1 = await putTask2(meatball);
      expect(resp1.status).toBe(200);
    });

    it("Congratulations u burnt the pan pt2", async () => {
      const resp = await putTask2({
        type: "ingredient",
        name: "beef",
        cookTime: -1,
      });
      expect(resp.status).toBe(400);
    });

    it("Congratulations u burnt the pan pt3", async () => {
      const resp = await putTask2({
        type: "pan",
        name: "pan",
        cookTime: 20,
      });
      expect(resp.status).toBe(400);
    });

    it("Unique names", async () => {
      const resp = await putTask2({
        type: "ingredient",
        name: "Beef",
        cookTime: 10,
      });
      expect(resp.status).toBe(200);

      const resp2 = await putTask2({
        type: "ingredient",
        name: "Beef",
        cookTime: 8,
      });
      expect(resp2.status).toBe(400);

      const resp3 = await putTask2({
        type: "recipe",
        name: "Beef",
        cookTime: 8,
      });
      expect(resp3.status).toBe(400);
    });

    it("Add Recipe w/h same ingredients", async () => {
      const meatloaf = {
        type: "recipe",
        name: "meatloaf",
        requiredItems: [
          { name: "Beef", quantity: 1 }, 
          { name: "bread", quantity: 2 }, 
          { name: "Beef", quantity: 1 }
        ],
      };
      const resp1 = await putTask2(meatloaf);
      expect(resp1.status).toBe(400);
      expect(resp1.body).toStrictEqual({ error: expect.any(String) });
    });

    it("Add Recipe w/h 2+ ingredients", async () => {
      const sushi = {
        type: "recipe",
        name: "sushi",
        requiredItems: [
          { name: "Salmon", quantity: 1 }, 
          { name: "Soy sauce", quantity: 2 }, 
          { name: "Rice wine", quantity: 1 },
          { name: "Seaweed", quantity: 10 },
        ],
      };
      const resp1 = await putTask2(sushi);
      expect(resp1.status).toBe(200);
    });
  });
});

describe("Task 3", () => {
  describe("GET /summary", () => {
    const postEntry = async (data) => {
      return await request("http://localhost:8080").post("/entry").send(data);
    };

    const getTask3 = async (name) => {
      return await request("http://localhost:8080").get(
        `/summary?name=${name}`
      );
    };

    it("What is bro doing - Get empty cookbook", async () => {
      const resp = await getTask3("nothing");
      expect(resp.status).toBe(400);
    });

    it("What is bro doing - Get ingredient", async () => {
      const resp = await postEntry({
        type: "ingredient",
        name: "beef",
        cookTime: 2,
      });
      expect(resp.status).toBe(200);

      const resp2 = await getTask3("beef");
      expect(resp2.status).toBe(400);
    });

    it("Unknown missing item", async () => {
      const cheese = {
        type: "recipe",
        name: "Cheese",
        requiredItems: [{ name: "Not Real", quantity: 1 }],
      };
      const resp1 = await postEntry(cheese);
      expect(resp1.status).toBe(200);

      const resp2 = await getTask3("Cheese");
      expect(resp2.status).toBe(400);
    });

    it("Bro cooked", async () => {
      const meatball = {
        type: "recipe",
        name: "Skibidi",
        requiredItems: [{ name: "Bruh", quantity: 1 }],
      };
      const resp1 = await postEntry(meatball);
      expect(resp1.status).toBe(200);

      const resp2 = await postEntry({
        type: "ingredient",
        name: "Bruh",
        cookTime: 2,
      });
      expect(resp2.status).toBe(200);

      const resp3 = await getTask3("Skibidi");
      expect(resp3.status).toBe(200);
    });

    it("Multiple RequiredItems & recursion", async () => {
      const unicornPie = {
        type: "recipe",
        name: "Unicorn Pie",
        requiredItems: [
          { name: "Bruh", quantity: 1 },
          { name: "Egg", quantity: 5},
          { name: "Red Dye", quantity: 1},
          { name: "Magic", quantity: 3 },
        ],
      };
      const resp1 = await postEntry(unicornPie);
      expect(resp1.status).toBe(200);

      const entries = [
        { type: "ingredient", name: "Red Dye", cookTime: 6 },
        { type: "ingredient", name: "Rice Wine", cookTime: 8 },
        { type: "ingredient", name: "Sprinkles", cookTime: 0 },
        { type: "recipe", name: "Magic", 
          requiredItems: [
            { name: "Bruh", quantity: 3 },
            { name: "Rice Wine", quantity: 23 },
            { name: "Sprinkles", quantity: 50 },
          ]
        },
      ];
      for (const entry of entries) {
        const resp = await postEntry(entry);
        expect(resp.status).toBe(200);
        expect(resp.body).toStrictEqual({});
      }
      
      const resp2 = await getTask3("Unicorn Pie");

      expect(resp2.status).toBe(200);
      expect(resp2.body).toStrictEqual({
        name: "Unicorn Pie",
        cookTime: 608,
        ingredients: [
          { name: "Bruh", quantity: 10 },
          { name: "Egg", quantity: 5 },
          { name: "Red Dye", quantity: 1 },
          { name: "Rice Wine", quantity: 69 },
          { name: "Sprinkles", quantity: 150 },
        ],
      });
    });

    it("Multiple RequiredItems & 2+ lvl recursion", async () => {
      const unicornCookie = {
        type: "recipe",
        name: "Unicorn Cookie",
        requiredItems: [
          { name: "Bruh", quantity: 1 },
          { name: "Egg", quantity: 5},
          { name: "Witchery", quantity: 4 },
          { name: "Red Dye", quantity: 1},
          { name: "Magic", quantity: 3 },
        ],
      };
      
      const resp1 = await postEntry(unicornCookie);
      expect(resp1.status).toBe(200);

      const witchery = {
        type: "recipe",
        name: "Witchery",
        requiredItems: [
          { name: "Red Dye", quantity: 4 },
          { name: "Magic", quantity: 2 },
          { name: "beef", quantity: 3 },
        ],
      };
      const resp2 = await postEntry(witchery);
      expect(resp2.status).toBe(200);
      
      const resp3 = await getTask3("Unicorn Cookie");

      expect(resp3.status).toBe(200);
      expect(resp3.body).toStrictEqual({
        name: "Unicorn Cookie",
        cookTime: 2248,
        ingredients: [
          { name: "Bruh", quantity: 34 },
          { name: "Egg", quantity: 5 },
          { name: "Red Dye", quantity: 17 },
          { name: "Rice Wine", quantity: 253 },
          { name: "Sprinkles", quantity: 550 },
          { name: "beef", quantity: 12 },
        ],
      });
    });

    it("Multiple RequiredItems & 2+ lvl recursion pt2", async () => {
      const devilsPie = {
        type: "recipe",
        name: "Devil's Pie",
        requiredItems: [
          { name: "Red Dye", quantity: 15 },
          { name: "Magic", quantity: 2 },
          { name: "Unicorn Cookie", quantity: 3 },
        ],
      };
      const resp1 = await postEntry(devilsPie);
      expect(resp1.status).toBe(200);
      
      const resp2 = await getTask3("Devil's Pie");

      expect(resp2.status).toBe(200);
      expect(resp2.body).toStrictEqual({
        name: "Devil's Pie",
        cookTime: 7214,
        ingredients: [
          { name: "Red Dye", quantity: 66 },
          { name: "Bruh", quantity: 108 },
          { name: "Rice Wine", quantity: 805 },
          { name: "Sprinkles", quantity: 1750 },
          { name: "Egg", quantity: 15 },
          { name: "beef", quantity: 36 },
        ],
      });
    });
  });
});
