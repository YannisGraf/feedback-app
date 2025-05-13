import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://woalbnuncsutaefidfdv.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvYWxibnVuY3N1dGFlZmlkZmR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcxNTc1NjYsImV4cCI6MjA2MjczMzU2Nn0.p281yotGGU-TtQc-FdPrzCLCIeIUVfNVYM3I0SA3j38";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function App() {
  const [dates, setDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [meals, setMeals] = useState([]);
  const [selectedMeals, setSelectedMeals] = useState([]);
  const [ratings, setRatings] = useState({});
  const [comments, setComments] = useState({});

  useEffect(() => {
    const fetchDates = async () => {
      const { data } = await supabase.from("menus").select("id, date").order("date", { ascending: false });
      if (data) setDates(data);
    };
    fetchDates();
  }, []);

  const fetchMeals = async (menuId) => {
    const { data } = await supabase.from("meals").select("*").eq("menu_id", menuId);
    setMeals(data || []);
    setSelectedMeals([]);
    setRatings({});
    setComments({});
  };

  const handleMealSelect = (mealId) => {
    setSelectedMeals((prev) =>
      prev.includes(mealId) ? prev.filter((id) => id !== mealId) : [...prev, mealId]
    );
  };

  const handleSubmit = async () => {
    for (const mealId of selectedMeals) {
      await supabase.from("responses").insert([{
        meal_id: mealId,
        rating: ratings[mealId] || null,
        comment: comments[mealId] || "",
      }]);
    }
    alert("Feedback submitted! Thank you.");
    setSelectedDate("");
    setMeals([]);
    setSelectedMeals([]);
    setRatings({});
    setComments({});
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-xl font-bold mb-4 text-center">Meal Feedback Survey</h1>

      <label className="block mb-2 font-medium">Select Date</label>
      <select
        className="w-full border rounded p-2 mb-4"
        value={selectedDate}
        onChange={(e) => {
          const menuId = e.target.value;
          setSelectedDate(menuId);
          fetchMeals(menuId);
        }}
      >
        <option value="">-- Choose a date --</option>
        {dates.map((menu) => (
          <option key={menu.id} value={menu.id}>
            {new Date(menu.date).toLocaleDateString()}
          </option>
        ))}
      </select>

      {meals.map((meal) => (
        <div key={meal.id} className="mb-4 border rounded p-3">
          <label className="flex items-center space-x-2 mb-2">
            <input
              type="checkbox"
              checked={selectedMeals.includes(meal.id)}
              onChange={() => handleMealSelect(meal.id)}
            />
            <span>{meal.name}</span>
          </label>
          {selectedMeals.includes(meal.id) && (
            <>
              <label className="block mb-1">Rating (1-5)</label>
              <input
                type="number"
                min="1"
                max="5"
                value={ratings[meal.id] || ""}
                onChange={(e) =>
                  setRatings((prev) => ({ ...prev, [meal.id]: parseInt(e.target.value) }))
                }
                className="w-full border rounded p-1 mb-2"
              />
              <label className="block mb-1">Comment (optional)</label>
              <textarea
                className="w-full border rounded p-1"
                value={comments[meal.id] || ""}
                onChange={(e) =>
                  setComments((prev) => ({ ...prev, [meal.id]: e.target.value }))
                }
              />
            </>
          )}
        </div>
      ))}

      {meals.length > 0 && (
        <button
          onClick={handleSubmit}
          className="bg-blue-600 text-white px-4 py-2 rounded w-full mt-4"
        >
          Submit Feedback
        </button>
      )}
    </div>
  );
}
