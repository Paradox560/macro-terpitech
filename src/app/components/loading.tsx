import React, { useEffect, useState } from "react";
import { Montserrat, Jost, Nunito } from "next/font/google";

const montserrat = Montserrat({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

const nunito = Nunito({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

const foodFunFacts = [
  "Bananas are berries, but strawberries aren't.",
  "Honey never spoils.",
  "Chocolate was once used as currency.",
  "Apples belong to the rose family.",
  "Pineapples grow on plants that look like shrubs, not trees.",
  "The average person eats about 12 pounds of pizza per year.",
  "Ketchup was once sold as medicine.",
  "Peanuts are legumes, not nuts.",
  "Broccoli is a man-made vegetable.",
  "The most expensive spice in the world is saffron.",
  "Cranberries bounce because they have small air pockets inside.",
  "Avocados are technically a single-seeded berry.",
  "Cashews grow on trees, hanging from a fleshy stem called a cashew apple.",
  "White chocolate isn't actually chocolate; it doesn't contain cocoa solids.",
  "The holes in Swiss cheese are caused by bacteria producing carbon dioxide gas during the aging process.",
  "Carrots were originally purple.",
  "Lobsters were once considered poor people's food.",
  "Popcorn is made from a specific type of corn called 'Zea mays everta'.",
  "The smell of freshly baked bread makes people friendlier.",
  "Eating dark chocolate can improve brain function.",
];

const Loading = () => {
  const [index, setIndex] = useState<number>(0);
  const [fact, setFact] = useState<string>(foodFunFacts[0]);

  useEffect(() => {
    // Update the fact every 5 seconds
    const intervalId = setInterval(() => {
      // Increment index and wrap around to 0 when reaching the end of the array
      setIndex((prevIndex) => {
        const newIndex = (prevIndex + 1) % foodFunFacts.length;
        // Update the fact based on new index
        setFact(foodFunFacts[newIndex]);
        return newIndex;
      });
    }, 5000);

    // Clean up the interval on component unmount
    return () => clearInterval(intervalId);
  }, []); // Empty dependency array ensures this runs once on component mount

  return (
    <div className="flex flex-col items-center justify-center w-screen h-screen bg-[#E8F5E9]">
      <div className="flex p-4">
        <div className="animate-[bounce_1s_ease-in-out_300ms_infinite] bg-[#E13318] rounded-full h-9 w-9 m-1"></div>
        <div className="animate-[bounce_1s_ease-in-out_500ms_infinite] bg-[#E13318] rounded-full h-9 w-9 m-1"></div>
        <div className="animate-[bounce_1s_ease-in-out_700ms_infinite] bg-[#E13318] rounded-full h-9 w-9 m-1"></div>
      </div>
      <div className={`${nunito.className} text-black text-2xl text-center`}>
        <h1 className="text-black text-3xl text-center font-bree-serif">
          Loading
        </h1>
        <h1 className="text-black text-3xl text-center font-bree-serif">
          Please wait...
        </h1>
      </div>
      <div className="bg-[#9CD3A0] opacity-85 rounded-lg shadow-md p-6 mb-6 mx-10 mt-7">
        <h2
          className={`${montserrat.className} text-center items-center text-xl font-bold mb-4 text-black`}
        >
          Fun Food Facts!
        </h2>
        <div className={`${nunito.className} space-y-4`}>
          <div className="pl-4 py-1">
            <p className="italic text-black mb-2 min-h-[4rem] flex items-center justify-center text-center">
              {fact}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Loading;
