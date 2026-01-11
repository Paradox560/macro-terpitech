"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { collection, doc, getDoc, setDoc } from "firebase/firestore";
import { toast } from "sonner";
import { db } from "../../../firebase";
import { useUser } from "@clerk/nextjs";
import { Montserrat, Jost, Nunito } from "next/font/google";

const montserrat = Montserrat({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

const jost = Jost({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

const nunito = Nunito({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

interface Food {
  food_name: string;
  serving_size: string;
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

interface UserDetails {
  diningHall: string;
  allergens: string[];
  specialDiets: string[];
  calories: number;
  protein: number;
  fats: number;
  carbs: number;
}

export default function Page() {
  const { user } = useUser();
    const [, setLoading] = useState(false);
    const [refreshToggle, setRefreshToggle] = useState(false);

  const [isSpinning1, setIsSpinning1] = useState(false);
  const [isSpinning2, setIsSpinning2] = useState(false);
  const [isSpinning3, setIsSpinning3] = useState(false);
  const [isSpinning4, setIsSpinning4] = useState(false);
  const [isSpinning5, setIsSpinning5] = useState(false);
  const [isSpinning6, setIsSpinning6] = useState(false);
  const [isSpinning7, setIsSpinning7] = useState(false);
  const [isSpinning8, setIsSpinning8] = useState(false);
  const [isSpinning9, setIsSpinning9] = useState(false);

  const [breakfastList, setBreakfastList] = useState<Meal[]>([]);
  const [lunchList, setLunchList] = useState<Meal[]>([]);
  const [dinnerList, setDinnerList] = useState<Meal[]>([]);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);

  const [breakfast, setBreakfast] = useState<boolean>(false);
  const [lunch, setLunch] = useState<boolean>(false);
  const [dinner, setDinner] = useState<boolean>(false);

  const handleRefreshClick1 = () => {
    // Start spinning
    setIsSpinning1(true);
    // Stop the spin after 1 second
    setTimeout(() => {
      setIsSpinning1(false);
    }, 1000);
  };
  const handleRefreshClick2 = () => {
    // Start spinning
    setIsSpinning2(true);
    // Stop the spin after 1 second
    setTimeout(() => {
      setIsSpinning2(false);
    }, 1000);
  };
  const handleRefreshClick3 = () => {
    // Start spinning
    setIsSpinning3(true);
    // Stop the spin after 1 second
    setTimeout(() => {
      setIsSpinning3(false);
    }, 1000);
  };
  const handleRefreshClick4 = () => {
    // Start spinning
    setIsSpinning4(true);
    // Stop the spin after 1 second
    setTimeout(() => {
      setIsSpinning4(false);
    }, 1000);
  };
  const handleRefreshClick5 = () => {
    // Start spinning
    setIsSpinning5(true);
    // Stop the spin after 1 second
    setTimeout(() => {
      setIsSpinning5(false);
    }, 1000);
  };
  const handleRefreshClick6 = () => {
    // Start spinning
    setIsSpinning6(true);
    // Stop the spin after 1 second
    setTimeout(() => {
      setIsSpinning6(false);
    }, 1000);
  };
  const handleRefreshClick7 = () => {
    // Start spinning
    setIsSpinning7(true);
    // Stop the spin after 1 second
    setTimeout(() => {
      setIsSpinning7(false);
    }, 1000);
  };
  const handleRefreshClick8 = () => {
    // Start spinning
    setIsSpinning8(true);
    // Stop the spin after 1 second
    setTimeout(() => {
      setIsSpinning8(false);
    }, 1000);
  };
  const handleRefreshClick9 = () => {
    // Start spinning
    setIsSpinning9(true);
    // Stop the spin after 1 second
    setTimeout(() => {
      setIsSpinning9(false);
    }, 1000);
  };

  const regenerateMeal = async (meal: string, mealNumber: string) => {
    if (!user?.id) {
      toast.error("You must be logged in to save your macros");
      return;
    }

    setLoading(true);

      try {
          let numberOfMeals = 0;
          if (breakfast) {
              numberOfMeals++;
          }
          if (lunch) {
              numberOfMeals++;
          }
          if (dinner) {
              numberOfMeals++;
          }
          
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
          mealNumber: numberOfMeals,
          requestNumber: 1,
          allergens: userDetails?.allergens,
          diningHall: userDetails?.diningHall,
          diets: userDetails?.specialDiets,
          meals: [meal],
          calories: userDetails?.calories,
          protein: userDetails?.protein,
          fat: userDetails?.fats,
          carbs: userDetails?.carbs,
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const responseData = await response.json();
      // console.log("API Response:", responseData.data);
      const mealRef = collection(doc(db, "users", user.id), meal);
      await setDoc(doc(mealRef, mealNumber), responseData.data[0]);
        
        setRefreshToggle(!refreshToggle);

      // console.log("Meal list:", mealList);
      toast.success("Meal generated successfully!");

      if (!responseData.data) {
        toast.error("No food data available");
        setLoading(false);
        return;
      }
    } catch (error) {
      console.error("Error generating meals:", error);
      toast.error("Error generating meals");
    } finally {
      setLoading(false); // Stop loading state
    }
  };

  useEffect(() => {
    const loadUserData = async () => {
      if (!user?.id) return;

      const userDocRef = doc(db, "users", user.id);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();

        // Transform Firebase data to match UserDetails interface
        const transformedUserData: UserDetails = {
          diningHall: userData.diningHall || "Yahentamitsi",
          allergens: Array.isArray(userData.allergens)
            ? userData.allergens
            : [],
          specialDiets: Array.isArray(userData.specialDiets)
            ? userData.specialDiets
            : [],
          calories: userData.macros?.calories || 0,
          protein: userData.macros?.protein || 0,
          fats: userData.macros?.fats || 0,
          carbs: userData.macros?.carbs || 0,
        };

        setUserDetails(transformedUserData);
        console.log("User data:", userDetails);

        let meals: (Meal | null)[] = Array(3).fill(null);

        const breakfastRef = collection(userDocRef, "Breakfast");
        for (let i = 1; i <= 3; i++) {
          const mealDoc = await getDoc(doc(breakfastRef, `Meal ${i}`));
          if (mealDoc.exists()) {
            const mealData = mealDoc.data();
            setBreakfast(true);
            meals[i - 1] = mealData as Meal;
          }
        }

        if (meals[0] !== null) {
          setBreakfastList(meals.filter((meal) => meal !== null) as Meal[]);
        }

        meals = Array(3).fill(null);

        const lunchRef = collection(userDocRef, "Lunch");
        for (let i = 1; i <= 3; i++) {
          const mealDoc = await getDoc(doc(lunchRef, `Meal ${i}`));
          if (mealDoc.exists()) {
            const mealData = mealDoc.data();
            setLunch(true);
            meals[i - 1] = mealData as Meal;
          }
        }

        if (meals[0] !== null) {
          setLunchList(meals.filter((meal) => meal !== null) as Meal[]);
        }

        meals = Array(3).fill(null);

        const dinnerRef = collection(userDocRef, "Dinner");
        for (let i = 1; i <= 3; i++) {
          const mealDoc = await getDoc(doc(dinnerRef, `Meal ${i}`));
          if (mealDoc.exists()) {
            const mealData = mealDoc.data();
            setDinner(true);
            meals[i - 1] = mealData as Meal;
          }
        }

        if (meals[0] !== null) {
          setDinnerList(meals.filter((meal) => meal !== null) as Meal[]);
        }
      }
    };

    loadUserData();
  }, [user?.id, refreshToggle]);

  return (
    <div className="bg-white">
      <div>
        <p
          className={`${montserrat.className} text-center text-2xl font-bold mb-2 mt-4`}
        >
          Your Curated Meals:
        </p>
      </div>

      {breakfast && (
        <div className="bg-[#E8F5E9] p-4 rounded-md shadow mb-4 mx-10">
          <p
            className={`${jost.className} text-center text-2xl font-bold mb-2`}
          >
            Breakfast:
          </p>
          <div className="flex flex-row justify-evenly gap-4">
            {breakfastList.map((meal, index) => (
              <Card
                key={`breakfast-${index}`}
                className="h-[400px] w-[400px] bg-white"
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className={montserrat.className}>
                      {meal.name || `Breakfast Meal ${index + 1}`}
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        // Use the appropriate spin function based on index
                        const spinFunctions = [
                          handleRefreshClick1,
                          handleRefreshClick2,
                          handleRefreshClick3,
                        ];
                        spinFunctions[index]();
                        regenerateMeal("Breakfast", `Meal ${index + 1}`);
                      }}
                    >
                      <img
                        src="https://img.icons8.com/?size=100&id=59872&format=png&color=000000"
                        alt="Refresh"
                        className={`${
                          [isSpinning1, isSpinning2, isSpinning3][index]
                            ? "animate-spin"
                            : ""
                        } h-5 w-5`}
                      />
                    </Button>
                  </div>
                  <CardDescription className={nunito.className}>
                            {meal.description || "Breakfast Meal" + (index + 1)}
                  </CardDescription>
                </CardHeader>
                <CardContent
                  className={`${nunito.className} flex-1 overflow-y-auto`}
                >
                  <div className="border-t border-gray-300 mt-2 pt-2">
                    <p className="font-bold">Meal Details:</p>
                    <ul className="list-disc pl-4">
                      <li>
                        <strong>Total Calories:</strong> {meal.total_calories}
                      </li>
                      <li>
                        <strong>Total Fat:</strong> {meal.total_fat}g
                      </li>
                      <li>
                        <strong>Total Protein:</strong> {meal.total_protein}g
                      </li>
                      <li>
                        <strong>Total Carbs:</strong> {meal.total_carbs}g
                      </li>
                    </ul>
                  </div>
                  <div className="border-t border-gray-300 mt-2 pt-2">
                    <p className="font-bold">Ingredients:</p>
                    <ul className="list-disc pl-4">
                      {meal.foods.map((food, foodIndex) => (
                        <li key={`food-${index}-${foodIndex}`}>
                          <strong>
                            {food.food_name} ({food.serving_size}):
                          </strong>
                          <ul className="list-none pl-4">
                            <li>Calories: {food.calories}</li>
                            <li>Fat: {food.fats}g</li>
                            <li>Carbs: {food.carbs}g</li>
                            <li>Protein: {food.protein}g</li>
                          </ul>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

{lunch && (
        <div className="bg-[#E8F5E9] p-4 rounded-md shadow mb-4 mx-10">
          <p
            className={`${jost.className} text-center text-2xl font-bold mb-2`}
          >
            Lunch:
          </p>
          <div className="flex flex-row justify-evenly gap-4">
            {lunchList.map((meal, index) => (
              <Card
                key={`lunch-${index}`}
                className="h-[400px] w-[400px] bg-white"
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className={montserrat.className}>
                      {meal.name || `Breakfast Meal ${index + 1}`}
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        // Use the appropriate spin function based on index
                        const spinFunctions = [
                          handleRefreshClick4,
                          handleRefreshClick5,
                          handleRefreshClick6,
                        ];
                        spinFunctions[index]();
                        regenerateMeal("Lunch", `Meal ${index + 1}`);
                      }}
                    >
                      <img
                        src="https://img.icons8.com/?size=100&id=59872&format=png&color=000000"
                        alt="Refresh"
                        className={`${
                          [isSpinning4, isSpinning5, isSpinning6][index]
                            ? "animate-spin"
                            : ""
                        } h-5 w-5`}
                      />
                    </Button>
                  </div>
                  <CardDescription className={nunito.className}>
                            {meal.description || "Lunch Meal" + (index + 1)}
                  </CardDescription>
                </CardHeader>
                <CardContent
                  className={`${nunito.className} flex-1 overflow-y-auto`}
                >
                  <div className="border-t border-gray-300 mt-2 pt-2">
                    <p className="font-bold">Meal Details:</p>
                    <ul className="list-disc pl-4">
                      <li>
                        <strong>Total Calories:</strong> {meal.total_calories}
                      </li>
                      <li>
                        <strong>Total Fat:</strong> {meal.total_fat}g
                      </li>
                      <li>
                        <strong>Total Protein:</strong> {meal.total_protein}g
                      </li>
                      <li>
                        <strong>Total Carbs:</strong> {meal.total_carbs}g
                      </li>
                    </ul>
                  </div>
                  <div className="border-t border-gray-300 mt-2 pt-2">
                    <p className="font-bold">Ingredients:</p>
                    <ul className="list-disc pl-4">
                      {meal.foods.map((food, foodIndex) => (
                        <li key={`food-${index}-${foodIndex}`}>
                          <strong>
                            {food.food_name} ({food.serving_size}):
                          </strong>
                          <ul className="list-none pl-4">
                            <li>Calories: {food.calories}</li>
                            <li>Fat: {food.fats}g</li>
                            <li>Carbs: {food.carbs}g</li>
                            <li>Protein: {food.protein}g</li>
                          </ul>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
          )}
      {dinner && (
        <div className="bg-[#E8F5E9] p-4 rounded-md shadow mb-4 mx-10">
          <p
            className={`${jost.className} text-center text-2xl font-bold mb-2`}
          >
            Dinner:
          </p>
          <div className="flex flex-row justify-evenly gap-4">
            {dinnerList.map((meal, index) => (
              <Card
                key={`dinner-${index}`}
                className="h-[400px] w-[400px] bg-white"
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className={montserrat.className}>
                      {meal.name || `Dinner Meal ${index + 1}`}
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        // Use the appropriate spin function based on index
                        const spinFunctions = [
                          handleRefreshClick7,
                          handleRefreshClick8,
                          handleRefreshClick9,
                        ];
                        spinFunctions[index]();
                        regenerateMeal("Dinner", `Meal ${index + 1}`);
                      }}
                    >
                      <img
                        src="https://img.icons8.com/?size=100&id=59872&format=png&color=000000"
                        alt="Refresh"
                        className={`${
                          [isSpinning7, isSpinning8, isSpinning9][index]
                            ? "animate-spin"
                            : ""
                        } h-5 w-5`}
                      />
                    </Button>
                  </div>
                  <CardDescription className={nunito.className}>
                            {meal.description || "Dinner Meal" + (index + 1)}
                  </CardDescription>
                </CardHeader>
                <CardContent
                  className={`${nunito.className} flex-1 overflow-y-auto`}
                >
                  <div className="border-t border-gray-300 mt-2 pt-2">
                    <p className="font-bold">Meal Details:</p>
                    <ul className="list-disc pl-4">
                      <li>
                        <strong>Total Calories:</strong> {meal.total_calories}
                      </li>
                      <li>
                        <strong>Total Fat:</strong> {meal.total_fat || 0}g
                      </li>
                      <li>
                        <strong>Total Protein:</strong> {meal.total_protein}g
                      </li>
                      <li>
                        <strong>Total Carbs:</strong> {meal.total_carbs}g
                      </li>
                    </ul>
                  </div>
                  <div className="border-t border-gray-300 mt-2 pt-2">
                    <p className="font-bold">Ingredients:</p>
                    <ul className="list-disc pl-4">
                      {meal.foods.map((food, foodIndex) => (
                        <li key={`food-${index}-${foodIndex}`}>
                          <strong>
                            {food.food_name} ({food.serving_size}):
                          </strong>
                          <ul className="list-none pl-4">
                            <li>Calories: {food.calories}</li>
                            <li>Fat: {food.fats}g</li>
                            <li>Carbs: {food.carbs}g</li>
                            <li>Protein: {food.protein}g</li>
                          </ul>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
          )}
      </div>
  );
}
