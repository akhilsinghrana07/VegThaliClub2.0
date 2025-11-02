"use client";
import Image from "next/image";
import { useState } from "react";
import Masonry from "react-masonry-css";
import { Icon } from "@iconify/react";
import clsx from "clsx";

const Gallery = () => {
  const [isOrderOpen, setIsOrderOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [finalQuote, setFinalQuote] = useState<number>(0);

  const openOrder = (pkg: any) => {
    setSelectedPackage(pkg);
    setIsOrderOpen(true);
    setCurrentStep(1);
    setSelectedItems([]);
    setSelectedAddOns([]);
    setFinalQuote(parseFloat(pkg.price));
  };

  const closeOrder = () => {
    setIsOrderOpen(false);
  };

  const galleryImages = [
    {
      name: "Vegetarian",
      price: "16.99",
      src: "/images/res/1.jpg",
      description: "Pick 3 Dishes & 1 Dessert",
      items: ["Boondi Raita", "Jeera Rice", "Salad", "Tandoori Naan or Roti"],
    },
    {
      name: "Snacks & Main Course",
      price: "25.00",
      src: "/images/res/2.jpg",
      description: "Pick 2 Sweets & 2 Items",
      sweets: [
        "Gulab Jamun",
        "Khoya Barfi",
        "Besan Barfi",
        "Badam Barfi",
        "Gajar Barfi",
      ],
      items: [
        "Aloo Tikki",
        "Gobi Pakoda",
        "Palak Pakoda",
        "Mix Veg Pakora",
        "Samosa",
        "Spring Roll",
      ],
    },
    {
      name: "Vegetarian Premium",
      price: "30.00",
      src: "/images/res/3.jpg",
      description: "Pick 4 Veg Snacks, 4 Main Course & 1 Dessert",
      items: ["Rice", "Raita", "Salad", "Plain Naan or Tandoori Naan"],
    },
  ];

  const addOnMenu = {
    vegetarianSnacks: [
      "Paneer Pakora",
      "Samosa",
      "Tandoori Soya Chaap",
      "Chat Papri",
      "Dahi Bhalla",
    ],
    vegetarianChoices: [
      "Mix Veg",
      "Aloo Gobhi",
      "Karahi Soya Chaap",
      "Palak Saag",
      "Channa Masala",
    ],
  };

  const toggleSelection = (item: string, type: "item" | "addon") => {
    if (type === "item") {
      setSelectedItems((prev) =>
        prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
      );
    } else {
      setSelectedAddOns((prev) =>
        prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
      );
      setFinalQuote((q) => (selectedAddOns.includes(item) ? q - 2.5 : q + 2.5)); // each add-on = +$2.5
    }
  };

  const nextStep = () => setCurrentStep((s) => Math.min(3, s + 1));
  const prevStep = () => setCurrentStep((s) => Math.max(1, s - 1));

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

        <div className="my-16 px-4 md:px-6">
          <Masonry
            breakpointCols={{ default: 3, 1100: 2, 700: 1 }}
            className="flex gap-6"
            columnClassName="masonry-column"
          >
            {galleryImages.map((pkg, index) => (
              <div
                key={index}
                className="group rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 bg-white border border-green-100"
              >
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

                <div className="p-6">
                  <p className="text-lg font-semibold text-gray-900 mb-3">
                    {pkg.description}
                  </p>
                  <ul className="text-gray-700 text-sm space-y-1 mb-3">
                    {pkg.items?.map((i, idx) => (
                      <li key={idx}>• {i}</li>
                    ))}
                  </ul>

                  {pkg.sweets && (
                    <>
                      <p className="text-base font-semibold text-primary mb-1">
                        Sweets Options
                      </p>
                      <ul className="text-gray-700 text-sm space-y-1 mb-3">
                        {pkg.sweets.map((s, si) => (
                          <li key={si}>• {s}</li>
                        ))}
                      </ul>
                    </>
                  )}

                  <button
                    onClick={() => openOrder(pkg)}
                    className="inline-block text-center w-full rounded-full bg-primary text-white text-sm font-medium py-2.5 hover:bg-primary/90 transition-all duration-300"
                  >
                    Order Now
                  </button>
                </div>
              </div>
            ))}
          </Masonry>
        </div>

        {/* ORDER FLOW MODAL */}
        {isOrderOpen && (
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

              {/* STEP INDICATOR */}
              <div className="flex justify-center gap-3 mb-6">
                {[1, 2, 3].map((step) => (
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

              {/* STEP CONTENT */}
              {currentStep === 1 && (
                <div className="animate-slideIn">
                  <h3 className="text-xl font-semibold text-center mb-3 text-primary">
                    Select Your Dishes
                  </h3>
                  <p className="text-sm text-gray-600 text-center mb-4">
                    Choose your favorites from the package items below:
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedPackage.items?.map((item, i) => (
                      <button
                        key={i}
                        onClick={() => toggleSelection(item, "item")}
                        className={clsx(
                          "border rounded-full py-2 px-4 text-sm transition-all",
                          selectedItems.includes(item)
                            ? "bg-primary text-white"
                            : "border-gray-300 hover:border-primary"
                        )}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="animate-slideIn">
                  <h3 className="text-xl font-semibold text-center mb-3 text-primary">
                    Add-On Selections
                  </h3>
                  <p className="text-sm text-gray-600 text-center mb-4">
                    Pick any extra snacks or dishes for $2.50 each:
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      ...addOnMenu.vegetarianSnacks,
                      ...addOnMenu.vegetarianChoices,
                    ].map((addon, i) => (
                      <button
                        key={i}
                        onClick={() => toggleSelection(addon, "addon")}
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

              {currentStep === 3 && (
                <div className="animate-slideIn text-center">
                  <h3 className="text-xl font-semibold text-primary mb-4">
                    Your Quote Summary
                  </h3>
                  <p className="text-gray-700 text-sm mb-2">
                    Base Package: <strong>${selectedPackage.price}</strong>
                  </p>
                  <p className="text-gray-700 text-sm mb-2">
                    Add-Ons Selected: <strong>{selectedAddOns.length}</strong>
                  </p>
                  <p className="text-lg font-semibold text-green-700 mb-4">
                    Final Quote: ${finalQuote.toFixed(2)} / person
                  </p>
                  <p className="text-sm text-gray-500">
                    We’ll contact you soon to confirm your order preferences.
                  </p>
                </div>
              )}

              {/* FOOTER BUTTONS */}
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
                {currentStep < 3 ? (
                  <button
                    onClick={nextStep}
                    className="px-5 py-2 bg-primary text-white rounded-full hover:bg-primary/90 text-sm"
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
