"use client";

import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { collection, doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../../firebase";
import { Toaster, toast } from "sonner";
import Loading from "@/app/components/loading";
import { useRouter } from "next/navigation";
import { Montserrat, Jost, Nunito} from 'next/font/google'

const allergens = [
  { letter: "D", color: "bg-blue-500", tooltip: "Dairy" },
  { letter: "E", color: "bg-yellow-500", tooltip: "Egg" },
  { letter: "S", color: "bg-lime-500", tooltip: "Soy" },
  { letter: "G", color: "bg-amber-500", tooltip: "Gluten" },
  { letter: "N", color: "bg-red-500", tooltip: "Nuts" },
  { letter: "SS", color: "bg-orange-500", tooltip: "Sesame" },
  { letter: "F", color: "bg-pink-500", tooltip: "Fish" },
  { letter: "SF", color: "bg-teal-500", tooltip: "Shellfish" },
];

const diets = [
  { letter: "V", color: "bg-emerald-800", tooltip: "Vegetarian" },
  { letter: "VG", color: "bg-purple-500", tooltip: "Vegan" },
  { letter: "HF", color: "bg-cyan-500", tooltip: "HalalFriendly" },
];
// "{
//   "description": "This dinner features a delicious and protein-rich Moroccan Chicken paired with a side of roasted vegetables.",
//   "foods": [
//     {
//       "calories": 140.0,
//       "carbs": 2.0,
//       "fat": 5.8,
//       "food_name": "Moroccan Chicken",
//       "protein": 20.0,
//       "serving_size": "4 oz"
//     },
//     {
//       "calories": 86.0,
//       "carbs": 6.9,
//       "fat": 6.6,
//       "food_name": "Curry Roasted Vegetables",
//       "protein": 1.5,
//       "serving_size": "3 oz"
//     },
//     {
//       "calories": 7.0,
//       "carbs": 1.0,
//       "fat": 0.2,
//       "food_name": "Arugula",
//       "protein": 0.7,
//       "serving_size": "1 oz"
//     },
//     {
//       "calories": 5.0,
//       "carbs": 1.1,
//       "fat": 0.1,
//       "food_name": "Grape Tomatoes",
//       "protein": 0.2,
//       "serving_size": "1 oz"
//     }
//   ],
//   "name": "Moroccan Chicken with Curry Roasted Vegetables",
//   "total_calories": 238.0,
//   "total_carbs": 11.0,
//   "total_fat": 12.7,
//   "total_protein": 22.4
// }"

interface Food {
  food_name: string;
  servingSize: string;
  calories: string;
  fats: string;
  carbs: string;
  protein: string;
}

interface Meal {
  name: string;
  description: string;
  total_calories: number;
  total_fat: number;
  total_carbs: number;
  total_protein: number;
  foods: Food[];
}

// const systemPrompt = `You are a nutritionist and a culinary master. You are given a list of foods that your client can eat, 
// and each item in the list contains the food name, the serving size, the calories per serving, the fat per serving, the carbs
// per serving, and the protein per serving. Please create 1 meal from this given food list. You should calculate the total calories,
// total fat, total carbs, and the total protein of the meal based on the number of servings you’re recommending and the calories, fat,
// carbs, and protein per serving. You should create a name for this meal, a one sentence description, and specify each food you used
// in the meal, and the serving size, total calories, fat, carbs, and protein. We will also give you the number of calories, fat, carbs,
// and protein the user wants to eat for this meal. Please make your meal’s total calories, fat, carbs, and protein come as close to
// possible as what the user wants to eat with it serving as a lower bound. Please limit yourself to only using a maximum of 7 ingredients.
// For each food, specify how many calories, fat, carbs, and protein the total serving.
// When responding to future queries, you MUST return in the following JSON format, no other comments necessary:
// {
//   info: {
//     “name”: string,
//     “description”: string
//     “total_calories”: number
//     “total_fat”: number
//     “total_carbs”: number
//     “total_fat”: number,
//     foods: [
//       {
//         "food_name": string,
//         “serving_size”: string,
//         “calories”: number,
//         “fat”: number,
//         “carbs”: number,
//         “protein”: number,
//       },
//       {
//         "food_name": string,
//         “serving_size”: string,
//         “calories”: number,
//         “fat”: number,
//         “carbs”: number,
//         “protein”: number,
//       },
//     ]
// }`;

const montserrat = Montserrat({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
});

const jost = Jost({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
})

const nunito = Nunito({
  weight: '500',
  subsets: ['latin'],
  display: 'swap',
})


/* Switched them around to save time instead of actually switching them */
const dining_halls = ["Breakfast", "Lunch", "Dinner"];
const meals = ["Yahentamitsi", "251", "South"];

export default function EnterInformation() {
  const router = useRouter();  
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const maxValue = 9999; // Define the max value for the input

  const [inputValueCalories, setinputValueCalories] = useState<number | string>(
    0
  ); // Allow number or string (for empty input)
  const [inputValueProtein, setinputValueProtein] = useState<number | string>(
    0
  ); // Allow number or string (for empty input)
  const [inputValueCarbs, setinputValueCarbs] = useState<number | string>(0); // Allow number or string (for empty input)
  const [inputValueFat, setinputValueFat] = useState<number | string>(0); // Allow number or string (for empty input)

  const [clickedOne, setClickedOne] = useState(Array(8).fill(false));
  const [hoveredIndexOne, setHoveredIndexOne] = useState<number | null>(null);
  const [clickedTwo, setClickedTwo] = useState(Array(3).fill(false));
  const [hoveredIndexTwo, setHoveredIndexTwo] = useState<number | null>(null);

  /*Meal selection*/
  const [clickedMeal, setClickedMeal] = useState<number | null>(null);

  /*Dining hall*/
  const [clickedHall, setClickedHall] = useState([false, false, false]);

  const [caloriesSelected, setcaloriesSelected] = useState<string>("");
  const [hallSelected, setHallSelected] = useState<string>("");
  const [mealSelected, setMealSelected] = useState<string>("");

  const [foodList, setFoodList] = useState<FoodList[]>();
  const [mealList, setMealList] = useState<Meal[]>([]);

  const isFormValid =
    caloriesSelected !== "" && hallSelected !== "" && mealSelected !== "";

  const toggleClickOne = (index: number) => {
    const updated = [...clickedOne];
    updated[index] = !updated[index];
    setClickedOne(updated);
  };

  const toggleClickTwo = (index: number) => {
    const updated = [...clickedTwo];
    updated[index] = !updated[index];
    setClickedTwo(updated);
  };

  const handleInputChangeCalories = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    if (value === "") {
      setinputValueCalories("");
    } else {
      const parsedValue = parseInt(value, 10);
      if (!isNaN(parsedValue)) {
        if (parsedValue <= maxValue) {
          setinputValueCalories(parsedValue);
        }
      }

      setcaloriesSelected("valid");
    }
  };

  const handleInputChangeProtein = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "") {
      setinputValueProtein("");
    } else {
      const parsedValue = parseInt(value, 10);
      if (!isNaN(parsedValue)) {
        if (parsedValue <= maxValue) {
          setinputValueProtein(parsedValue);
        }
      }
    }
  };

  const handleInputChangeCarbs = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "") {
      setinputValueCarbs("");
    } else {
      const parsedValue = parseInt(value, 10);
      if (!isNaN(parsedValue)) {
        if (parsedValue <= maxValue) {
          setinputValueCarbs(parsedValue);
        }
      }
    }
  };

  const handleInputChangeFat = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "") {
      setinputValueFat("");
    } else {
      const parsedValue = parseInt(value, 10);
      if (!isNaN(parsedValue)) {
        if (parsedValue <= maxValue) {
          setinputValueFat(parsedValue);
        }
      }
    }
  };

  const handleClickMeal = (index: number) => {
    setClickedMeal(clickedMeal === index ? null : index);
    setMealSelected("valid");
  };

  const handleClickHall = (index: number) => {
    const updatedClickedHall = [...clickedHall];
    updatedClickedHall[index] = !updatedClickedHall[index];
    setClickedHall(updatedClickedHall);
    setHallSelected("valid");
  };

  const isNumber = (value: number | string): value is number => {
    return typeof value === "number";
  };

  // Add this function in your page.tsx file, before your return statement
  // const generateMeal = async () => {
  //   if (!foodList || foodList.length === 0) {
  //     toast.error("No food data available. Please try again.");
  //     return;
  //   }

  //   setLoading(true);
  //   try {
  //     const userPrompts = [];
  //     const len = foodList.length;
  //     // console.log("fl" + foodList);
  //     for (let i = 0; i < len; i++) {
  //       const f = foodList[i].ingredients;
  //       // Prepare user prompt with foodList and desired macros
  //       let userPrompt = `
  //       Here's my food list for specifically the ${
  //         foodList[i].meal
  //       } meal, do not create plans for any other meals besides the one specified: ${JSON.stringify(
  //         f
  //       )}

  //       Please create a list of foods and quantities as specified by the JSON format with these nutritional targets:
  //       - Calories: ${Number(inputValueCalories) / len}`;

  //       if (inputValueProtein) {
  //         userPrompt += `\n- Protein: ${Number(inputValueProtein) / len}`;
  //       }

  //       if (inputValueCarbs) {
  //         userPrompt += `\n- Carbs: ${Number(inputValueCarbs) / len}`;
  //       }

  //       if (inputValueFat) {
  //         userPrompt += `\n- Fat: ${Number(inputValueFat) / len}`;
  //       }

  //       userPrompts.push(userPrompt);
  //     }

  //     console.log("User Prompt" + userPrompts);

  //     // Call the API endpoint
  //     const response = await fetch("/api/generate", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({
  //         systemPrompt: systemPrompt,
  //         userPrompts: userPrompts,
  //       }),
  //     });

  //     if (!response.ok) {
  //       throw new Error(`API request failed with status ${response.status}`);
  //     }

  //     toast.success("Meal generated successfully!");
  //   } catch (error) {
  //     console.error("Error generating meal:", error);
  //     toast.error("Failed to generate meal plan. Please try again.");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleSubmit = async () => {
    if (!user?.id) {
      toast.error("You must be logged in to save your macros");
      return;
    }

    setLoading(true);

    try {
      const userDocRef = doc(db, "users", user.id);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        throw new Error("User document not found in database");
      }

      // Update macros in Firestore (unchanged from your code)
      const updatedMacros = {
        calories: inputValueCalories,
        protein: inputValueProtein,
        fats: inputValueFat,
        carbs: inputValueCarbs,
      };

      await updateDoc(userDocRef, {
        macros: updatedMacros,
      });

      toast.success("Your macros have been updated successfully!");

      // Get selected preferences (unchanged from your code)
      const selectedAllergens = allergens
        .filter((_, index) => clickedOne[index])
        .map((allergen) => allergen.tooltip);

      const selectedDiets = diets
        .filter((_, index) => clickedTwo[index])
        .map((diet) => diet.tooltip);

      const selectedMeal = dining_halls.filter(
        (_, index) => clickedHall[index]
      );
      const selectedDiningHall = clickedMeal !== null ? meals[clickedMeal] : null;

      await updateDoc(userDocRef, {
        allergens: selectedAllergens,
        specialDiets: selectedDiets,
        diningHall: selectedDiningHall || "Yahentamitsi",
        meals: selectedMeal,
      });

      console.log("User data updated successfully");

      for (let i = 0; i < selectedMeal.length; i++) {
        const response = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mealNumber: selectedMeal.length,
            requestNumber: 3,
            allergens: selectedAllergens,
            diningHall: selectedDiningHall,
            diets: selectedDiets,
            meals: [selectedMeal[i]],
            calories: inputValueCalories,
            protein: inputValueProtein,
            fat: inputValueFat,
            carbs: inputValueCarbs,
          }),
        });
      

        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }

        const responseData = await response.json();
        // console.log("API Response:", responseData.data);

        setMealList(responseData.data);

        const mealRef = collection(userDocRef, selectedMeal[i]);
        for (let j = 0; j < responseData.data.length; j++) {
          await setDoc(doc(mealRef, 'Meal ' + (j + 1)), responseData.data[j]);
        }

        // console.log("Meal list:", mealList);
        toast.success("Meal generated successfully!");

        if (!responseData.data) {
          toast.error("No food data available");
          setLoading(false);
          return;
        }
      }

      // Transform the data to match our FoodList interface
      // const transformedFoodList: FoodList[] = Object.entries(
      //   responseData.data
      // ).map(([meal, ingredients]) => {
      //   // Transform ingredients data to match the Food interface
      //   const formattedIngredients: Food[] = (ingredients as any[][]).map(
      //     (item) => {
      //       return {
      //         name: item[0] || "Unknown",
      //         servingSize: item[1] || "1 serving",
      //         calories: item[2] || "0",
      //         fats: item[3] || "0",
      //         carbs: item[4] || "0",
      //         protein: item[5] || "0",
      //       };
      //     }
      //   );

      //   return {
      //     meal: meal,
      //     ingredients: formattedIngredients,
      //   };
      // });

      // console.log("Transformed food list:", transformedFoodList);
      // setFoodList(transformedFoodList);

      // Wait a moment to ensure the foodList state is updated
      // setTimeout(() => {
      //   generateMeal();
      // }, 1000);
    } catch (error) {
      console.error("Error updating user data:", error);
      toast.error("Failed to update your information. Please try again.");
    } finally {
      setLoading(false);
      router.push("/meals");
    }
  };

  useEffect(() => {
    const loadUserData = async () => {
      if (!user?.id) return;

      try {
        const userDocRef = doc(db, "users", user.id);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();

          if (userData.macros) {
            if (userData.macros.calories) {
              setinputValueCalories(userData.macros.calories);
              setcaloriesSelected("valid");
            }
            setinputValueProtein(userData.macros.protein || 0);
            setinputValueCarbs(userData.macros.carbs || 0);
            setinputValueFat(userData.macros.fats || 0);
          }

          if (userData.allergens) {
            const updatedClickedOne = allergens.map((_, index) =>
              userData.allergens.includes(allergens[index].tooltip)
            );
            setClickedOne(updatedClickedOne);
          }

          if (userData.specialDiets) {
            const updatedClickedTwo = diets.map((_, index) =>
              userData.specialDiets.includes(diets[index].tooltip)
            );
            setClickedTwo(updatedClickedTwo);
          }

          if (userData.diningHall) {
            if (userData.diningHall === "Yahentamitsi") {
              setClickedMeal(0);
            } else if (userData.diningHall === "251") {
              setClickedMeal(1);
            } else if (userData.diningHall === "South") {
              setClickedMeal(2);
            }
            setHallSelected("valid");
          }

          if (userData.meals) {
            const updatedClickedMeal = [false, false, false];
            if (userData.meals.includes("Breakfast")) { 
              updatedClickedMeal[0] = true;
            }
            if (userData.meals.includes("Lunch")) {
              updatedClickedMeal[1] = true;
            }
            if (userData.meals.includes("Dinner")) {
              updatedClickedMeal[2] = true;
            }
            setMealSelected("valid");
            setClickedHall(updatedClickedMeal);
          }
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      }
    };

    loadUserData();
  }, [user?.id]);

  if (loading) {
    return <Loading />;
  }

  return (
    <div>
      {/* Add Toaster component to render toast notifications */}
      <Toaster position="top-center" />
  
      {/* Main heading */}
      <div className="absolute top-[8vh] left-1/2 transform -translate-x-1/2 items-center justify-center text-center">
        <h1>Please enter the following information</h1>
      </div>
      
      <div className="absolute top-[15vh] left-1/2 transform -translate-x-1/2 items-center justify-center text-center">
        <h1>Calories<span className="text-red-500">*</span></h1>
      </div>
  
      <div className="absolute top-[15vh] left-[10vw] transform -translate-x-1/2 items-center justify-center text-center font-bold">
        <h1>Step 1: Macros</h1>
      </div>
  
      {/* Calories input circle */}
      <div
        className={`absolute top-[20vh] left-1/2 transform -translate-x-1/2 w-[19vw] h-[19vw] rounded-full flex items-center justify-center border-8 z-10 ${
          isNumber(inputValueCalories) && inputValueCalories > 0  
          ? "border-[#9CD3A0] bg-[#E8F5E9]" : "border-gray bg-white"
        }`}
      >
        <input
          type="number"
          value={inputValueCalories}
          onChange={handleInputChangeCalories}
          max={maxValue}
          step="1"
          className="w-full h-full bg-transparent text-black text-6xl text-center outline-none"
        />
      </div>
  
      <style>{`
        input[type="number"]::-webkit-outer-spin-button,
        input[type="number"]::-webkit-inner-spin-button {
            -webkit-appearance: none;
            margin: 0;
        }
  
        input[type="number"] {
            -moz-appearance: textfield;
        }
      `}</style>
  
      {/* Protein input */}
      <div className="absolute top-[32vh] left-1/4 transform -translate-x-1/2 items-center justify-center text-center">
        <h1>Protein (g)</h1>
      </div>
      <div
        className={`absolute top-[36vh] left-1/4 transform -translate-x-1/2 w-[9vw] h-[9vw] rounded-full flex items-center justify-center border-5 z-10 ${
          isNumber(inputValueProtein) && inputValueProtein > 0  
          ? "border-[#9CD3A0] bg-[#E8F5E9]" : "border-gray bg-white"
        }`}
      >
        <input
          type="number"
          value={inputValueProtein}
          onChange={handleInputChangeProtein}
          className="w-full h-full bg-transparent text-black text-3xl text-center outline-none"
        />
      </div>
  
      {/* Carbs input */}
      <div className="absolute top-[22vh] left-13/16 transform -translate-x-1/2 items-center justify-center text-center">
        <h1>Carbs (g)</h1>
      </div>
      <div
        className={`absolute top-[22vh] left-3/4 transform -translate-x-1/2 w-[7vw] h-[7vw] rounded-full flex items-center justify-center border-3 ${
          isNumber(inputValueCarbs) && inputValueCarbs > 0
          ? "border-[#9CD3A0] bg-[#E8F5E9]" : "border-gray bg-white"
        }`}
      >
        <input
          type="number"
          value={inputValueCarbs}
          onChange={handleInputChangeCarbs}
          className="w-full h-full bg-transparent text-black text-2xl text-center outline-none"
        />
      </div>
  
      {/* Fats input */}
      <div className="absolute top-[40vh] left-43/64 transform -translate-x-1/2 items-center justify-center text-center">
        <h1>Fats (g)</h1>
      </div>
      <div
        className={`absolute top-[40vh] left-20/32 transform -translate-x-1/2 w-[5vw] h-[5vw] rounded-full flex items-center justify-center border-2 ${
          isNumber(inputValueFat) && inputValueFat > 0 ?
          "border-[#9CD3A0] bg-[#E8F5E9]" : "border-gray bg-white"
        }`}
      >
        <input
          type="number"
          value={inputValueFat}
          onChange={handleInputChangeFat}
          className="w-full h-full bg-transparent text-black text-lg text-center outline-none"
        />
      </div>
  
      {/* Step 2: Restrictions */}
      <div className="absolute top-[70vh] left-[10vw] transform -translate-x-1/2 items-center justify-center text-center font-bold">
        <h1>Step 2: Restrictions</h1>
      </div>
  
      <div className="absolute top-[75vh] left-2/8 transform -translate-x-1/2 items-center justify-center text-center">
        <h1>Avoid</h1>
      </div>
      <div className="absolute top-[80vh] left-1/4 transform -translate-x-1/2 flex flex-wrap gap-1 justify-center items-center">
        {allergens.map((btn, index) => (
          <div key={index} className="relative">
            {hoveredIndexOne === index && (
              <div className="absolute -top-[5vh] left-1/2 -translate-x-1/2 bg-gray-700 text-white text-xs px-2 py-1 rounded shadow">
                {btn.tooltip}
              </div>
            )}
            <button
              onClick={() => toggleClickOne(index)}
              onMouseEnter={() => setHoveredIndexOne(index)}
              onMouseLeave={() => setHoveredIndexOne(null)}
              className={`w-8 h-8 cursor-pointer rounded-full flex items-center justify-center text-white font-bold text-xl transition-colors duration-300 ${
                clickedOne[index] ? btn.color : "bg-black"
              }`}
            >
              {btn.letter}
            </button>
          </div>
        ))}
      </div>
  
      {/* Move Special Diet underneath Allergens */}
      <div className="absolute top-[85vh] left-2/8 transform -translate-x-1/2 items-center justify-center text-center">
        <h1>Special Diet</h1>
      </div>
      <div className="absolute top-[90vh] left-1/4 transform -translate-x-1/2 flex flex-wrap gap-1 justify-center items-center">
        {diets.map((btn, index) => (
          <div key={index} className="relative">
            {hoveredIndexTwo === index && (
              <div className="absolute -top-[5vh] left-1/2 -translate-x-1/2 bg-gray-700 text-white text-xs px-2 py-1 rounded shadow">
                {btn.tooltip}
              </div>
            )}
            <button
              onClick={() => toggleClickTwo(index)}
              onMouseEnter={() => setHoveredIndexTwo(index)}
              onMouseLeave={() => setHoveredIndexTwo(null)}
              className={`w-8 h-8 rounded-full cursor-pointer flex items-center justify-center text-white font-bold text-xl transition-colors duration-300 ${
                clickedTwo[index] ? btn.color : "bg-black"
              }`}
            >
              {btn.letter}
            </button>
          </div>
        ))}
      </div>
  
      {/* Step 3: Dining Hall and Meals */}
      <div className="absolute top-[50vh] left-14/16 transform -translate-x-1/2 items-center justify-center text-center font-bold">
        <h1>Step 3: Dining Hall and Meals</h1>
      </div>
  
      {/* Meals selection buttons (Dining Hall) */}
      <div className="absolute top-[200vh] left-1/2 -translate-x-1/2 flex flex-col space-y-2 items-center z-20">
      {meals.map((label, index) => (
        <button
          key={index}
          onClick={() => handleClickMeal(index)}
          className={` ${nunito.className} cursor-pointer w-30 h-10 flex items-center justify-center rounded text-white font-semibold px-1 py-2 
            ${clickedMeal === index ? "bg-[#568F3D]" : "bg-gray-500"} 
            focus:outline-none 
            ${clickedMeal === index ? "bg-[#568F3D]" : ""} // No hover effect after clicked
          `}
        >
          {label}
        </button>
      ))}
    </div>

{/* Dining halls selection buttons (Meal Times) */}
<div className="absolute top-[60vh] left-15/16 -translate-x-1/2 flex flex-col space-y-6 items-center z-20">
  {dining_halls.map((label, index) => (
    <Button
      key={index}
      onClick={() => handleClickHall(index)}
      className={`w-30 h-10 flex items-center justify-center rounded text-white font-semibold ${
        clickedHall[index] ? "bg-[#568F3D]" : "bg-black"
      }`}
    >
      {label}
    </Button>
  ))}
</div>
  
      {/* Submit button */}
      <div className="fixed absolute top-[92vh] left-1/2 transform -translate-x-1/2">
        <Button
          disabled={!isFormValid} 
          onClick={handleSubmit}
          className="w-30 h-10 flex items-center justify-center rounded-full text-white font-semibold bg-[#E13318] hover:bg-red-800 cursor-pointer"
        >
          Submit
        </Button>
      </div>
    </div>
  );
}