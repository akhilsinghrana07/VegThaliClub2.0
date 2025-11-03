"use client";
import Image from "next/image";
import { useState } from "react";
import Masonry from "react-masonry-css";
import clsx from "clsx";

/* -------------------- Types -------------------- */
type PackageType = {
  name: string;
  price: string;
  src: string;
  description: string;
  baseItems: string[];
};

type AddOnMenuType = {
  vegetarianSnacks: string[];
  vegetarianChoices: string[];
  chineseSnacks: string[];
  paneerChoices: string[];
  dessertChoices: string[];
};

/* -------------------- Component -------------------- */
const Gallery = () => {
  const [isOrderOpen, setIsOrderOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedPackage, setSelectedPackage] = useState<PackageType | null>(
    null
  );

  // Selections
  const [rotiChoice, setRotiChoice] = useState<string>("");
  const [selectedMains, setSelectedMains] = useState<string[]>([]);
  const [selectedDessert, setSelectedDessert] = useState<string>("");
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [finalQuote, setFinalQuote] = useState<number>(0);

  /* -------------------- Data -------------------- */
  const galleryImages: PackageType[] = [
    {
      name: "Signature Feast",
      price: "16.99",
      src: "/images/res/1.jpg",
      description: "Pick 3 Mains & 1 Dessert — perfect for casual gatherings.",
      baseItems: ["Boondi Raita", "Jeera Rice", "Salad", "Roti or Naan"],
    },
    {
      name: "Royal Celebration",
      price: "25.00",
      src: "/images/res/2.jpg",
      description: "Includes 4 Mains, 1 Dessert, and Premium Snacks.",
      baseItems: ["Boondi Raita", "Jeera Rice", "Salad", "Tandoori Naan"],
    },
    {
      name: "Grand Deluxe",
      price: "30.00",
      src: "/images/res/3.jpg",
      description:
        "Our ultimate catering combo — 5 Mains, 2 Desserts, full service.",
      baseItems: ["Boondi Raita", "Jeera Rice", "Salad", "Tandoori Naan"],
    },
  ];

  const addOnMenu: AddOnMenuType = {
    vegetarianSnacks: [
      "Aloo Tikki",
      "Samosa",
      "Palak Pakora",
      "Veg Pakora",
      "Paneer Pakora",
      "Chat Papri",
      "Spring Roll",
      "Dahi Bhalla",
      "Bhel Puri",
      "Pani Puri",
      "Chilli Paneer",
      "Veg Manchurian",
      "Tandoori Soya Chaap",
    ],
    chineseSnacks: [
      "Manchurian",
      "Veg Chilli",
      "Chilli Paneer",
      "Chilli Potato",
      "Fried Rice (Veg)",
      "Noodles (Veg)",
    ],
    paneerChoices: [
      "Shahi Paneer",
      "Palak Saag Paneer",
      "Mutter Paneer",
      "Malai Kofta",
    ],
    vegetarianChoices: [
      "Mix Veg",
      "Kebab Curry",
      "Kadhi Pakoda",
      "Aloo Gobhi",
      "Palak Saag",
      "Karahi Soya Chaap",
      "Veg Manchurian",
      "Soya Chaap Tikka Masala",
      "Channa Masala",
    ],
    dessertChoices: ["Gajjar Halwa", "Gulab Jamun", "Suji Halwa"],
  };

  /* -------------------- Handlers -------------------- */
  const openOrder = (pkg: PackageType) => {
    setSelectedPackage(pkg);
    setIsOrderOpen(true);
    setCurrentStep(1);
    setRotiChoice("");
    setSelectedMains([]);
    setSelectedDessert("");
    setSelectedAddOns([]);
    setFinalQuote(parseFloat(pkg.price));
  };

  const closeOrder = () => setIsOrderOpen(false);

  const toggleMain = (dish: string) => {
    setSelectedMains((prev) => {
      if (prev.includes(dish)) return prev.filter((d) => d !== dish);
      if (prev.length < 3) return [...prev, dish];
      return prev; // limit to 3
    });
  };

  const toggleAddOn = (item: string) => {
    setSelectedAddOns((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
    setFinalQuote((q) => (selectedAddOns.includes(item) ? q - 2.5 : q + 2.5));
  };

  const nextStep = () => setCurrentStep((s) => Math.min(5, s + 1));
  const prevStep = () => setCurrentStep((s) => Math.max(1, s - 1));

  const canProceed = () => {
    if (currentStep === 1) return !!rotiChoice;
    if (currentStep === 2) return selectedMains.length === 3;
    if (currentStep === 3) return !!selectedDessert;
    return true;
  };

  /* -------------------- Render -------------------- */
  return (
    <section id="menu" className="scroll-mt-20">
      <div className="container">
        <div className="text-center">
          <p className="text-primary text-lg font-medium mb-3 tracking-widest uppercase">
            Our Packages
          </p>
          <h2 className="text-3xl font-bold tracking-tight">
            Explore Our Signature Catering Options
          </h2>
        </div>

        {/* Gallery Cards */}
        <div className="my-16 px-4 md:px-6">
          <Masonry
            breakpointCols={{ default: 3, 1100: 2, 700: 1 }}
            className="flex gap-6"
            columnClassName="masonry-column"
          >
            {galleryImages.map((pkg, index) => (
              <div
                key={index}
                onClick={() => openOrder(pkg)}
                className="group cursor-pointer rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 bg-white border border-green-100 hover:-translate-y-1"
              >
                {/* Image Section */}
                <div className="relative h-64 w-full overflow-hidden">
                  <Image
                    src={pkg.src}
                    alt={pkg.name}
                    width={600}
                    height={500}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-green-900/70 to-transparent flex flex-col justify-end p-6">
                    <h3 className="text-white text-2xl font-semibold">
                      {pkg.name}
                    </h3>
                    <p className="text-white/90 text-sm">
                      ${pkg.price} / person
                    </p>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6">
                  <p className="text-lg font-semibold text-gray-900 mb-3">
                    {pkg.description}
                  </p>

                  {/* Included Items */}
                  <div className="bg-green-50 border border-green-100 rounded-xl p-3 mb-3">
                    <p className="text-green-700 text-sm font-medium mb-2">
                      Included in Every Meal:
                    </p>
                    <ul className="text-gray-700 text-sm space-y-1">
                      <li>• Boondi Raita</li>
                      <li>• Jeera Rice</li>
                      <li>• Salad</li>
                      {pkg.name === "Signature Feast" && (
                        <li>• Roti or Naan</li>
                      )}
                    </ul>
                  </div>

                  <p className="text-primary text-sm font-medium mt-2">
                    Tap anywhere to customize your feast →
                  </p>
                </div>
              </div>
            ))}
          </Masonry>
        </div>

        {/* Modal */}
        {isOrderOpen && selectedPackage && (
          <div
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
            onClick={closeOrder}
          >
            <div
              className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl p-6 relative overflow-hidden animate-fadeIn"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={closeOrder}
                className="absolute top-3 right-3 text-gray-500 hover:text-primary text-2xl"
              >
                ✕
              </button>

              {/* Step Indicators */}
              <div className="flex justify-center gap-3 mb-6">
                {[1, 2, 3, 4, 5].map((step) => (
                  <div
                    key={step}
                    className={clsx(
                      "w-3 h-3 rounded-full transition-all",
                      currentStep >= step
                        ? "bg-primary scale-125"
                        : "bg-gray-300"
                    )}
                  />
                ))}
              </div>

              {/* Step 1 - Roti/Naan */}
              {currentStep === 1 && (
                <div className="animate-slideIn text-center">
                  <h3 className="text-xl font-semibold text-primary mb-3">
                    Choose Your Bread
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Select one option from your base package:
                  </p>
                  <div className="flex justify-center gap-4">
                    {["Roti", "Tandoori Naan"].map((b) => (
                      <button
                        key={b}
                        onClick={() => setRotiChoice(b)}
                        className={clsx(
                          "border rounded-full px-5 py-2 text-sm transition-all",
                          rotiChoice === b
                            ? "bg-primary text-white"
                            : "border-gray-300 hover:border-primary"
                        )}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2 - Main Dishes */}
              {currentStep === 2 && (
                <div className="animate-slideIn">
                  <h3 className="text-xl font-semibold text-primary mb-3 text-center">
                    Select 3 Main Dishes
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {addOnMenu.vegetarianChoices.map((dish) => (
                      <button
                        key={dish}
                        onClick={() => toggleMain(dish)}
                        className={clsx(
                          "border rounded-full py-2 px-3 text-sm transition-all",
                          selectedMains.includes(dish)
                            ? "bg-primary text-white"
                            : "border-gray-300 hover:border-primary"
                        )}
                      >
                        {dish}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 text-center mt-3">
                    {selectedMains.length}/3 selected
                  </p>
                </div>
              )}

              {/* Step 3 - Dessert */}
              {currentStep === 3 && (
                <div className="animate-slideIn text-center">
                  <h3 className="text-xl font-semibold text-primary mb-3">
                    Select 1 Dessert
                  </h3>
                  <div className="flex flex-wrap justify-center gap-3">
                    {addOnMenu.dessertChoices.map((d) => (
                      <button
                        key={d}
                        onClick={() => setSelectedDessert(d)}
                        className={clsx(
                          "border rounded-full py-2 px-4 text-sm transition-all",
                          selectedDessert === d
                            ? "bg-primary text-white"
                            : "border-gray-300 hover:border-primary"
                        )}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 4 - Add-Ons */}
              {currentStep === 4 && (
                <div className="animate-slideIn">
                  <h3 className="text-xl font-semibold text-primary mb-3 text-center">
                    Add-Ons ($2.50 each)
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      ...addOnMenu.vegetarianSnacks,
                      ...addOnMenu.chineseSnacks,
                      ...addOnMenu.paneerChoices,
                    ].map((addon) => (
                      <button
                        key={addon}
                        onClick={() => toggleAddOn(addon)}
                        className={clsx(
                          "border rounded-full py-2 px-3 text-sm transition-all",
                          selectedAddOns.includes(addon)
                            ? "bg-green-600 text-white"
                            : "border-gray-300 hover:border-green-400"
                        )}
                      >
                        {addon}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {/* Step 5 - Summary */}
              {currentStep === 5 && (
                <div className="animate-slideIn text-center">
                  <h3 className="text-xl font-semibold text-primary mb-4">
                    Quote Summary
                  </h3>

                  {/* Included Items */}
                  <div className="bg-green-50 border border-green-100 rounded-xl p-3 mb-4 inline-block text-left">
                    <p className="text-green-700 text-sm font-medium mb-2 text-center">
                      Included in Every Meal:
                    </p>
                    <ul className="text-gray-700 text-sm space-y-1 list-disc list-inside">
                      <li>Boondi Raita</li>
                      <li>Jeera Rice</li>
                      <li>Salad</li>
                      {selectedPackage?.name === "Signature Feast" && (
                        <li>Roti or Naan</li>
                      )}
                    </ul>
                  </div>

                  {/* User Selections */}
                  <p className="text-gray-700 text-sm mb-2">
                    Bread: <strong>{rotiChoice}</strong>
                  </p>
                  <p className="text-gray-700 text-sm mb-2">
                    Mains: <strong>{selectedMains.join(", ")}</strong>
                  </p>
                  <p className="text-gray-700 text-sm mb-2">
                    Dessert: <strong>{selectedDessert}</strong>
                  </p>
                  <p className="text-gray-700 text-sm mb-2">
                    Add-Ons:{" "}
                    <strong>
                      {selectedAddOns.length
                        ? selectedAddOns.join(", ")
                        : "None"}
                    </strong>
                  </p>

                  {/* Final Quote */}
                  <p className="text-lg font-semibold text-green-700 mt-3">
                    Final Quote: ${finalQuote.toFixed(2)} / person
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    We’ll contact you soon to confirm your order preferences.
                  </p>
                </div>
              )}

              {/* Footer Buttons */}
              <div className="mt-6 flex justify-between">
                {currentStep > 1 ? (
                  <button
                    onClick={prevStep}
                    className="px-5 py-2 border border-gray-300 rounded-full hover:bg-gray-100 text-sm"
                  >
                    Back
                  </button>
                ) : (
                  <span />
                )}

                {currentStep < 5 ? (
                  <button
                    disabled={!canProceed()}
                    onClick={nextStep}
                    className={clsx(
                      "px-5 py-2 rounded-full text-sm transition-all",
                      canProceed()
                        ? "bg-primary text-white hover:bg-primary/90"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    )}
                  >
                    Next
                  </button>
                ) : (
                  <button
                    onClick={closeOrder}
                    className="px-5 py-2 bg-green-700 text-white rounded-full hover:bg-green-600 text-sm"
                  >
                    Done
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Gallery;
