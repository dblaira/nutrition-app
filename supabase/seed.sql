-- Seed Data for Foods Table
-- Run this in the Supabase SQL Editor to populate your database with common foods.

INSERT INTO foods (name, brand, calories, protein, carbs, fat, serving_size)
VALUES
  ('Egg (Large)', 'Generic', 70, 6, 0, 5, '1 large'),
  ('Oatmeal (Rolled, Dry)', 'Quaker', 150, 5, 27, 3, '1/2 cup'),
  ('Chicken Breast (Cooked)', 'Kirkland', 165, 31, 0, 3.6, '100g'),
  ('White Rice (Cooked)', 'Generic', 205, 4, 45, 0.4, '1 cup'),
  ('Banana', 'Generic', 105, 1.3, 27, 0.3, '1 medium'),
  ('Whey Protein Powder', 'Optimum Nutrition', 120, 24, 3, 1, '1 scoop'),
  ('Avocado', 'Generic', 240, 3, 12, 22, '1 medium'),
  ('Almonds', 'Generic', 164, 6, 6, 14, '1 oz'),
  ('Greek Yogurt (Plain)', 'Chobani', 120, 16, 6, 0, '1 cup'),
  ('Salmon (Raw)', 'Generic', 208, 20, 0, 13, '100g');
