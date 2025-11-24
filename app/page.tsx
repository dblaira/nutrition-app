import { Flame, Utensils } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function Home() {
  const supabase = createClient();

  // 1. Check Auth
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  // 2. Fetch Profile (or create default if missing)
  let { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    // Lazy initialization for new users
    const { data: newProfile, error } = await supabase
      .from("profiles")
      .insert({
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || "Friend",
      })
      .select()
      .single();

    if (!error) profile = newProfile;
  }

  // 3. Fetch Today's Data
  const today = new Date().toISOString().split("T")[0];

  const { data: meals } = await supabase
    .from("meals")
    .select(`
      id,
      name,
      meal_entries (
        id,
        quantity,
        foods (
          name,
          calories,
          protein,
          carbs,
          fat
        )
      )
    `)
    .eq("user_id", user.id)
    .eq("date", today);



  // Calculate Totals
  let consumed = { calories: 0, protein: 0, carbs: 0, fat: 0 };
  const recentActivity: { id: string; name: string; calories: number; meal: string }[] = [];

  interface MealEntry {
    id: string;
    quantity: number;
    foods: {
      name: string;
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
    } | null; // foods can be null if joined incorrectly, though here it shouldn't be
  }

  interface Meal {
    id: string;
    name: string;
    meal_entries: MealEntry[];
  }

  (meals as unknown as Meal[])?.forEach((meal) => {
    meal.meal_entries.forEach((entry) => {
      const food = entry.foods;
      if (!food) return;

      const multiplier = entry.quantity;

      consumed.calories += food.calories * multiplier;
      consumed.protein += food.protein * multiplier;
      consumed.carbs += food.carbs * multiplier;
      consumed.fat += food.fat * multiplier;

      recentActivity.push({
        id: entry.id,
        name: food.name,
        calories: Math.round(food.calories * multiplier),
        meal: meal.name,
      });
    });
  });

  // Round totals
  consumed = {
    calories: Math.round(consumed.calories),
    protein: Math.round(consumed.protein),
    carbs: Math.round(consumed.carbs),
    fat: Math.round(consumed.fat),
  };

  const burned = 0; // We'll hook this up to 'daily_activity' later

  const goals = {
    calories: profile?.calorie_goal || 2400,
    protein: profile?.protein_goal || 150,
    carbs: profile?.carbs_goal || 250,
    fat: profile?.fat_goal || 80,
  };

  const remaining = (goals.calories + burned) - consumed.calories;

  return (
    <main className="min-h-screen p-4 md:p-8 space-y-8 max-w-md mx-auto md:max-w-4xl">
      {/* Header */}
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">Today</h1>
          <p className="text-muted-foreground">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
          </p>
        </div>
        <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold border border-primary/20">
          {profile?.email?.[0].toUpperCase() || "U"}
        </div>
      </header>

      {/* Main Stats Circle */}
      <section className="relative flex flex-col items-center justify-center py-8">
        <div className="w-64 h-64 rounded-full border-8 border-secondary flex flex-col items-center justify-center relative">
          {/* Dynamic Progress Border would go here */}
          <div className="absolute inset-0 rounded-full border-8 border-primary border-t-transparent rotate-45 opacity-50" />
          <span className="text-5xl font-display font-bold text-white">{remaining}</span>
          <span className="text-sm text-muted-foreground uppercase tracking-wider mt-1">Remaining</span>
        </div>

        <div className="grid grid-cols-3 gap-8 mt-8 w-full max-w-sm text-center">
          <div>
            <div className="text-2xl font-bold text-emerald-400">
              {goals.protein - consumed.protein}g
            </div>
            <div className="text-xs text-muted-foreground">Protein</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-400">
              {goals.carbs - consumed.carbs}g
            </div>
            <div className="text-xs text-muted-foreground">Carbs</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-400">
              {goals.fat - consumed.fat}g
            </div>
            <div className="text-xs text-muted-foreground">Fat</div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Link href="/log-food" className="glass-card p-4 rounded-2xl flex flex-col items-center justify-center gap-2 hover:bg-white/10 transition-colors group">
          <div className="h-10 w-10 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Utensils size={20} />
          </div>
          <span className="font-medium">Log Food</span>
        </Link>
        <button className="glass-card p-4 rounded-2xl flex flex-col items-center justify-center gap-2 hover:bg-white/10 transition-colors group">
          <div className="h-10 w-10 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Flame size={20} />
          </div>
          <span className="font-medium">Burn Calories</span>
        </button>
      </div>

      {/* Recent Activity */}
      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Recent</h2>
          <button className="text-primary text-sm hover:underline">View All</button>
        </div>

        {recentActivity.length > 0 ? (
          <div className="space-y-2">
            {recentActivity.map((item) => (
              <div key={item.id} className="glass-card p-4 rounded-xl flex justify-between items-center">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.meal}</p>
                </div>
                <span className="font-bold">{item.calories} cal</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-muted-foreground glass-card rounded-xl">
            No activity yet today.
          </div>
        )}
      </section>
    </main>
  );
}
