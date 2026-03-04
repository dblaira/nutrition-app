import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const today = new Date().toISOString().split("T")[0];

// From Adam's MFP diary — March 4, 2026 Breakfast
// Macros derived from the "Eggs" meal detail (533 cal, 4.9C, 19.9F, 66.7P)
// and standard nutritional data for remaining items
const foods = [
  { name: "Liquid Egg Whites, Trader Joe's",     serving: "30 Tbsp", calories: 250, carbs: 2,  fat: 0,   protein: 52 },
  { name: "Large Grade A Eggs, Vital Farms",      serving: "1 egg",   calories: 70,  carbs: 0,  fat: 5,   protein: 6  },
  { name: "Beef Tallow, Rendered, Epic",          serving: "1 tbsp",  calories: 130, carbs: 0,  fat: 14,  protein: 0  },
  { name: "Organic Baby Spinach, 365 Organic",    serving: "2 cup",   calories: 83,  carbs: 3,  fat: 1,   protein: 9  },
  { name: "Ezekiel Sprouted Wheat Bread",         serving: "1 slice", calories: 80,  carbs: 15, fat: 0.5, protein: 4  },
  { name: "Almond Butter, Classic, Justin's",     serving: "1 tbsp",  calories: 110, carbs: 4,  fat: 9,   protein: 4  },
  { name: "Wildflower Honey, Honey Pacifica",     serving: "1 tbsp",  calories: 60,  carbs: 16, fat: 0,   protein: 0  },
];

// Quantities per food — Ezekiel bread x2, almond butter x2, rest x1
const entries = [
  { foodIndex: 0, quantity: 1 },
  { foodIndex: 1, quantity: 1 },
  { foodIndex: 2, quantity: 1 },
  { foodIndex: 3, quantity: 1 },
  { foodIndex: 4, quantity: 2 },
  { foodIndex: 5, quantity: 2 },
  { foodIndex: 6, quantity: 1 },
];

async function seed() {
  const userId = "456ab1ff-538a-4ccc-a929-05e4fa8f716d"; // adamdblair@gmail.com

  // Ensure profile exists
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", userId)
    .single();

  if (!profile) {
    const { error } = await supabase.from("profiles").insert({
      id: userId,
      email: "adamdblair@gmail.com",
      full_name: "Adam Blair",
      calorie_goal: 2400,
      protein_goal: 215,
      carbs_goal: 215,
      fat_goal: 82,
    });
    if (error) {
      console.error("Failed to create profile:", error.message);
      process.exit(1);
    }
    console.log("Created profile for Adam Blair");
  }

  console.log(`User: ${userId}`);

  // Insert foods
  const foodIds = [];
  for (const food of foods) {
    // Check if food already exists (by name match)
    const { data: existing } = await supabase
      .from("foods")
      .select("id")
      .ilike("name", food.name)
      .limit(1)
      .single();

    if (existing) {
      foodIds.push(existing.id);
      console.log(`  Reusing existing food: ${food.name}`);
      continue;
    }

    const { data: newFood, error } = await supabase
      .from("foods")
      .insert({
        created_by: userId,
        name: food.name,
        calories: food.calories,
        protein: food.protein,
        carbs: food.carbs,
        fat: food.fat,
        caffeine_mg: 0,
        serving_size: food.serving,
        external_source: "mfp_import",
      })
      .select("id")
      .single();

    if (error) {
      console.error(`  Failed to create food "${food.name}":`, error.message);
      process.exit(1);
    }
    foodIds.push(newFood.id);
    console.log(`  Created food: ${food.name} (${food.calories} cal)`);
  }

  // Create or find today's Breakfast meal
  let { data: meal } = await supabase
    .from("meals")
    .select("id")
    .eq("user_id", userId)
    .eq("date", today)
    .eq("name", "Breakfast")
    .single();

  if (!meal) {
    const { data: newMeal, error } = await supabase
      .from("meals")
      .insert({ user_id: userId, date: today, name: "Breakfast" })
      .select("id")
      .single();

    if (error) {
      console.error("Failed to create meal:", error.message);
      process.exit(1);
    }
    meal = newMeal;
    console.log(`Created Breakfast meal for ${today}`);
  } else {
    console.log(`Breakfast meal already exists for ${today}`);
  }

  // Create meal entries
  for (const entry of entries) {
    const food = foods[entry.foodIndex];
    const { error } = await supabase.from("meal_entries").insert({
      meal_id: meal.id,
      food_id: foodIds[entry.foodIndex],
      quantity: entry.quantity,
      external_source: "mfp_import",
    });

    if (error) {
      console.error(`  Failed to link "${food.name}":`, error.message);
    } else {
      const totalCal = food.calories * entry.quantity;
      console.log(`  Logged: ${food.name} x${entry.quantity} (${totalCal} cal)`);
    }
  }

  // Print summary
  const totalCal = entries.reduce(
    (sum, e) => sum + foods[e.foodIndex].calories * e.quantity, 0
  );
  const totalProtein = entries.reduce(
    (sum, e) => sum + foods[e.foodIndex].protein * e.quantity, 0
  );
  console.log(`\nDone! Breakfast seeded for ${today}`);
  console.log(`Total: ${totalCal} cal, ${totalProtein}g protein`);
}

seed().catch(console.error);
