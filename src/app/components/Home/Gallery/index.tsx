"use client";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";

/* -----------------------------------
   Types
------------------------------------ */
type StepConfig = {
  title: string;
  category?: keyof AddOnMenuType;
  maxSelections?: number;
  isBreadChoice?: boolean;
  isWeightInput?: boolean; // For Khaman/Dhokla
};

type PackageType = {
  name: string;
  price: string; // per-person for normal packages; per-kg for Dhokla
  src: string;
  description: string;
  description2?: string; // Used for Khaman/Dhokla extra content
  baseItems: string[];
  steps: StepConfig[];
  isWeightBased?: boolean; // true => Dhokla flow
};

type AddOnMenuType = {
  vegetarianSnacks: string[];
  vegetarianChoices: string[];
  paneerChoices: string[];
  dessertChoices: string[];
};

type FormDataType = {
  fullName: string;
  phone: string;
  eventType: string; // used as Delivery Location / Address
  date: string; // datetime-local string
  email: string;
  partySize: number; // used only for non-weight-based packages
  message: string;
  weightKg?: number; // used for Khaman/Dhokla
};

/* -----------------------------------
   IndexedDB Helpers
------------------------------------ */
const DB_NAME = "catering-db";
const DB_STORE = "catering-store";
const DB_KEY = "in-progress";

function idbOpen(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(DB_STORE))
        db.createObjectStore(DB_STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbSet<T>(key: string, val: T) {
  const db = await idbOpen();
  await new Promise<void>((res, rej) => {
    const tx = db.transaction(DB_STORE, "readwrite");
    tx.objectStore(DB_STORE).put(val as any, key);
    tx.oncomplete = () => res();
    tx.onerror = () => rej(tx.error);
  });
  db.close();
}

async function idbGet<T>(key: string): Promise<T | undefined> {
  const db = await idbOpen();
  const out = await new Promise<T | undefined>((res, rej) => {
    const tx = db.transaction(DB_STORE, "readonly");
    const req = tx.objectStore(DB_STORE).get(key);
    req.onsuccess = () => res(req.result as T | undefined);
    req.onerror = () => rej(req.error);
  });
  db.close();
  return out;
}

async function idbClear(key: string) {
  const db = await idbOpen();
  await new Promise<void>((res, rej) => {
    const tx = db.transaction(DB_STORE, "readwrite");
    tx.objectStore(DB_STORE).delete(key);
    tx.oncomplete = () => res();
    tx.onerror = () => rej(tx.error);
  });
  db.close();
}

/* -----------------------------------
   Component
------------------------------------ */
const Gallery = () => {
  /* State */
  const [isOrderOpen, setIsOrderOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedPackage, setSelectedPackage] = useState<PackageType | null>(
    null
  );
  const [stepSelections, setStepSelections] = useState<
    Record<number, string[]>
  >({});
  const [includeEcoSet, setIncludeEcoSet] = useState(false); // only for non-weight-based
  const [basePerPerson, setBasePerPerson] = useState<number>(0);
  const ecoPerPerson = 1.49; // optional add-on for non-weight-based
  const [showCheckout, setShowCheckout] = useState(false);

  const [form, setForm] = useState<FormDataType>({
    fullName: "",
    phone: "",
    eventType: "",
    date: "",
    email: "",
    partySize: 15,
    message: "",
    weightKg: 1,
  });

  const [loading, setLoading] = useState(false);
  const [alertModal, setAlertModal] = useState<{
    show: boolean;
    title: string;
    message: string;
    type: "success" | "error";
  }>({ show: false, title: "", message: "", type: "success" });

  /* Data (menu) */
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
      "Veg Manchurian",
      "Chilli Paneer",
      "Tandoori Soya Chaap",
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

  // Bread options used when step.isBreadChoice is true
  const breadOptions = [
    "Tandoori Naan",
    "Roti",
    // "Plain Naan",
    // "Lachha Paratha",
    // "Tawa Roti",
  ];

  const mainCourseChoices = useMemo(
    () => [...addOnMenu.vegetarianChoices, ...addOnMenu.paneerChoices],
    []
  );

  /* Packages */
  const galleryImages: PackageType[] = [
    {
      name: "2 Veg Snacks Package",
      price: "16.99",
      src: "/images/res/0.png",
      description: "Pick 2 Vegetarian Snacks",
      baseItems: ["Boondi Raita", "Salad", "Mint Chutney"],
      steps: [
        {
          title: "Select 2 Veg Snacks",
          category: "vegetarianSnacks",
          maxSelections: 2,
        },
      ],
    },
    {
      name: "3 Veg Snacks Package",
      price: "19.99",
      src: "/images/res/7.jpg",
      description: "Pick 3 Vegetarian Snacks",
      baseItems: ["Mint Chutney", "Boondi Raita", "Salad"],
      steps: [
        {
          title: "Select 3 Veg Snacks",
          category: "vegetarianSnacks",
          maxSelections: 3,
        },
      ],
    },
    {
      name: "Vegetarian",
      price: "19.99",
      src: "/images/res/1.jpg",
      description: "Pick 3 Main Dishes, Bread & 1 Dessert",
      baseItems: ["Boondi Raita", "Jeera Rice", "Salad"],
      steps: [
        {
          title: "Select 3 Main Dishes (Paneer or Veg)",
          category: "vegetarianChoices",
          maxSelections: 3,
        },
        { title: "Choose Bread Option", isBreadChoice: true },
        {
          title: "Select 1 Dessert",
          category: "dessertChoices",
          maxSelections: 1,
        },
      ],
    },
    {
      name: "Snacks & Main Course",
      price: "29.99",
      src: "/images/res/2.jpg",
      description: "Pick 2 Veg Snacks, 3 Main Dishes, Bread & 2 Sweets",
      baseItems: ["Boondi Raita", "Jeera Rice", "Salad"],
      steps: [
        {
          title: "Pick 2 Veg Snacks",
          category: "vegetarianSnacks",
          maxSelections: 2,
        },
        {
          title: "Select 3 Main Dishes (Paneer or Veg)",
          category: "vegetarianChoices",
          maxSelections: 3,
        },
        { title: "Choose Bread Option", isBreadChoice: true },
        {
          title: "Pick 2 Sweets",
          category: "dessertChoices",
          maxSelections: 2,
        },
      ],
    },
    {
      name: "Premium Vegetarian",
      price: "34.99",
      src: "/images/res/3.jpg",
      description: "Pick 4 Veg Snacks, 3 Main Dishes, Bread & 1 Dessert",
      baseItems: ["Rice", "Raita", "Salad"],
      steps: [
        {
          title: "Pick 4 Veg Snacks",
          category: "vegetarianSnacks",
          maxSelections: 4,
        },
        {
          title: "Select 3 Main Dishes (Paneer or Veg)",
          category: "vegetarianChoices",
          maxSelections: 3,
        },
        { title: "Choose Bread Option", isBreadChoice: true },
        {
          title: "Pick 1 Dessert",
          category: "dessertChoices",
          maxSelections: 1,
        },
      ],
    },
    {
      name: "Gujju’s Special (Khaman / Dhokla)",
      price: "25.00",
      src: "/images/res/8.png",
      description:
        "Soft and spongy Khaman/Dhokla — Perfect for any occasion. $25 per kg.",
      description2:
        "Surati Nylon Khaman is a soft, spongy delicacy made from gram flour, balanced with subtle sweetness and tang, infused with mustard seeds, green chilies, and fresh coriander.",
      baseItems: [],
      steps: [{ title: "Enter quantity in kilograms", isWeightInput: true }],
      isWeightBased: true,
    },
  ];

  /* Derived */
  const currentPkgStep: StepConfig | null =
    selectedPackage?.steps[currentStep - 1] ?? null;
  const isSummaryStep = selectedPackage
    ? currentStep > selectedPackage.steps.length
    : false;

  const perPerson = includeEcoSet
    ? basePerPerson + ecoPerPerson
    : basePerPerson;

  const subtotal = selectedPackage?.isWeightBased
    ? (form.weightKg || 0) * parseFloat(selectedPackage.price)
    : perPerson * (form.partySize || 15);

  const grandTotal = subtotal;

  /* Persistence */
  useEffect(() => {
    idbSet(DB_KEY, {
      selectedPackageName: selectedPackage?.name ?? null,
      currentStep,
      stepSelections,
      includeEcoSet,
      basePerPerson,
      form,
      showCheckout,
    }).catch(() => {});
  }, [
    selectedPackage,
    currentStep,
    stepSelections,
    includeEcoSet,
    basePerPerson,
    form,
    showCheckout,
  ]);

  useEffect(() => {
    (async () => {
      const data = await idbGet<any>(DB_KEY);
      if (!data) return;

      if (data.selectedPackageName) {
        const pkg = galleryImages.find(
          (p) => p.name === data.selectedPackageName
        );
        if (pkg) {
          setSelectedPackage(pkg);
          setIsOrderOpen(true);
        }
      }
      if (typeof data.currentStep === "number")
        setCurrentStep(data.currentStep);
      if (data.stepSelections) setStepSelections(data.stepSelections);
      if (typeof data.includeEcoSet === "boolean")
        setIncludeEcoSet(data.includeEcoSet);
      if (typeof data.basePerPerson === "number")
        setBasePerPerson(data.basePerPerson);
      if (data.form) setForm(data.form);
      if (data.showCheckout) setShowCheckout(true);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Handlers */
  const openOrder = (pkg: PackageType) => {
    setSelectedPackage(pkg);
    setIsOrderOpen(true);
    setCurrentStep(1);
    setStepSelections({});
    setIncludeEcoSet(false);
    setShowCheckout(false);
    setBasePerPerson(parseFloat(pkg.price));
    setForm((prev) => ({
      ...prev,
      // for Dhokla ensure default weight
      weightKg: pkg.isWeightBased ? prev.weightKg || 1 : prev.weightKg,
      // reset party size for normal package
      partySize: pkg.isWeightBased
        ? prev.partySize
        : Math.max(15, prev.partySize || 15),
    }));
  };

  const closeOrder = async () => {
    setIsOrderOpen(false);
    setSelectedPackage(null);
    setShowCheckout(false);
    await idbClear(DB_KEY).catch(() => {});
  };

  const toggleSelection = (item: string, limit: number) => {
    setStepSelections((prev) => {
      const current = prev[currentStep] || [];
      if (current.includes(item)) {
        return { ...prev, [currentStep]: current.filter((i) => i !== item) };
      } else if (current.length < limit) {
        return { ...prev, [currentStep]: [...current, item] };
      }
      return prev;
    });
  };

  const selectBread = (bread: string) => {
    setStepSelections((prev) => ({ ...prev, [currentStep]: [bread] }));
  };

  const canProceedCurrent =
    !!currentPkgStep &&
    (currentPkgStep.isBreadChoice
      ? (stepSelections[currentStep]?.length || 0) >= 1
      : currentPkgStep.isWeightInput
      ? !!form.weightKg && form.weightKg > 0
      : (stepSelections[currentStep]?.length || 0) >=
        (currentPkgStep.maxSelections || 0));

  const nextStep = () => {
    if (!selectedPackage) return;
    const totalSteps = selectedPackage.steps.length;
    if (currentStep < totalSteps) setCurrentStep((s) => s + 1);
    else setCurrentStep(totalSteps + 1); // -> Summary
  };

  const prevStep = () => {
    if (showCheckout) {
      setShowCheckout(false);
      return;
    }
    if (currentStep > 1) setCurrentStep((s) => s - 1);
  };

  const proceedToCheckout = () => setShowCheckout(true);

  const validateForm = () => {
    if (!form.fullName || !form.phone || !form.email || !form.date) {
      setAlertModal({
        show: true,
        title: "Incomplete Form",
        message: "Please fill in Full Name, Phone, Email, and Date.",
        type: "error",
      });
      return false;
    }
    if (!selectedPackage?.isWeightBased && form.partySize < 15) {
      setAlertModal({
        show: true,
        title: "Minimum Party Size",
        message: "Party size must be at least 15.",
        type: "error",
      });
      return false;
    }
    if (
      selectedPackage?.isWeightBased &&
      (!form.weightKg || form.weightKg <= 0)
    ) {
      setAlertModal({
        show: true,
        title: "Enter Weight",
        message: "Please enter a valid weight (in kg) for Khaman/Dhokla.",
        type: "error",
      });
      return false;
    }
    return true;
  };

  const submitAll = async () => {
    if (!selectedPackage) return;
    if (!validateForm()) return;

    setLoading(true);
    try {
      const payload = {
        package: selectedPackage.name,
        isWeightBased: !!selectedPackage.isWeightBased,
        unitPrice: parseFloat(selectedPackage.price),
        baseItems: selectedPackage.baseItems,
        steps: selectedPackage.steps.map((s, idx) => ({
          title: s.title,
          selections: stepSelections[idx + 1] || [],
        })),
        includeEcoSet: !selectedPackage.isWeightBased
          ? includeEcoSet
          : undefined,
        perPerson: !selectedPackage.isWeightBased ? perPerson : undefined,
        subtotal,
        grandTotal,
        weightKg: selectedPackage.isWeightBased ? form.weightKg : undefined,
        form,
      };

      const res = await fetch("/api/send-catering-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to send request.");

      setAlertModal({
        show: true,
        title: "Request Submitted",
        message:
          "Your catering request has been sent. We’ll reach out shortly!",
        type: "success",
      });
      await idbClear(DB_KEY);
      closeOrder();
    } catch (err) {
      setAlertModal({
        show: true,
        title: "Submission Error",
        message: "Something went wrong while submitting your form.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  /* UI */
  return (
    <section id="menu" className="scroll-mt-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* HEADER */}
        <div className="text-center">
          <p className="text-primary text-lg font-medium mb-3 tracking-widest uppercase">
            Our Packages
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Explore Our Signature Catering Options
          </h2>
        </div>

        {/* PACKAGE CARDS */}
        <div className="my-16 grid grid-cols-1 sm:grid-cols-2 gap-6 mt-12">
          {galleryImages.map((pkg, i) => (
            <div
              key={i}
              onClick={() => openOrder(pkg)}
              className="group cursor-pointer bg-white border border-green-100 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 flex flex-col overflow-hidden"
            >
              <div className="relative w-full aspect-[372/200] overflow-hidden">
                <Image
                  src={pkg.src}
                  alt={pkg.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-green-900/70 to-transparent flex flex-col justify-end p-4 sm:p-6">
                  <h3 className="text-white text-xl sm:text-2xl font-semibold">
                    {pkg.name}
                  </h3>
                  <p className="text-white/90 text-sm sm:text-base">
                    {pkg.isWeightBased
                      ? `$${pkg.price}/kg`
                      : `$${pkg.price} / person`}
                  </p>
                </div>
              </div>
              <div className="flex flex-col justify-between flex-1 p-4 sm:p-6">
                <p className="text-base sm:text-lg font-semibold text-gray-900 mb-3 line-clamp-2">
                  {pkg.description}
                </p>

                {pkg.isWeightBased ? (
                  <div className="bg-green-50 border border-green-100 rounded-xl p-3 mb-3">
                    <p className="text-green-700 text-sm font-medium mb-2">
                      About this Dish:
                    </p>
                    <p className="text-gray-700 text-sm leading-snug">
                      {pkg.description2}
                    </p>
                  </div>
                ) : (
                  pkg.baseItems.length > 0 && (
                    <div className="bg-green-50 border border-green-100 rounded-xl p-3 mb-3 h-[120px] overflow-hidden">
                      <p className="text-green-700 text-sm font-medium mb-2">
                        Included in Every Meal:
                      </p>
                      <ul className="text-gray-700 text-sm space-y-1">
                        {pkg.baseItems.map((i) => (
                          <li key={i}>• {i}</li>
                        ))}
                      </ul>
                    </div>
                  )
                )}

                <p className="text-primary text-sm font-medium mt-auto">
                  Tap anywhere to customize →
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* MODAL */}
        {isOrderOpen && selectedPackage && (
          <div
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-2 sm:p-4"
            onClick={closeOrder}
          >
            <div
              className="bg-white rounded-3xl shadow-2xl w-[95vw] sm:w-full max-w-[95vw] sm:max-w-3xl max-h-[90vh] overflow-y-auto p-4 sm:p-6 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={closeOrder}
                className="absolute top-3 right-4 text-gray-500 hover:text-primary text-2xl"
                aria-label="Close"
              >
                ✕
              </button>

              {/* PROGRESS DOTS (Steps + Summary + Checkout) */}
              <div className="flex justify-center gap-2 mb-6 mt-2">
                {Array.from({
                  length: selectedPackage.steps.length + 2, // + Summary + Checkout
                }).map((_, idx) => {
                  const active = showCheckout
                    ? idx + 1 === selectedPackage.steps.length + 2
                    : currentStep >= idx + 1 ||
                      (isSummaryStep &&
                        idx + 1 === selectedPackage.steps.length + 1);
                  return (
                    <div
                      key={idx}
                      className={clsx(
                        "w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full transition-transform",
                        active ? "bg-primary scale-125" : "bg-gray-300"
                      )}
                    />
                  );
                })}
              </div>

              {/* STEP UI */}
              {!showCheckout && currentPkgStep && !isSummaryStep && (
                <div className="animate-slideIn">
                  <h3 className="text-lg sm:text-xl font-semibold text-primary mb-4 text-center">
                    {currentPkgStep.title}
                  </h3>

                  {/* Weight Input Step (Dhokla) */}
                  {currentPkgStep.isWeightInput && (
                    <>
                      {selectedPackage.description2 && (
                        <div className="bg-green-50 border border-green-100 rounded-xl p-3 mb-4 text-left max-w-md mx-auto">
                          <p className="text-green-700 text-sm font-medium mb-1">
                            About this Dish:
                          </p>
                          <p className="text-gray-700 text-sm leading-snug">
                            {selectedPackage.description2}
                          </p>
                        </div>
                      )}

                      <div className="text-center">
                        <label className="block text-sm text-gray-700 mb-2">
                          Enter Quantity (in kilograms)
                        </label>
                        <input
                          type="number"
                          min={0.5}
                          step={0.5}
                          value={form.weightKg}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              weightKg: Math.max(
                                0.5,
                                Number(e.target.value || 1)
                              ),
                            })
                          }
                          className="w-32 mx-auto border border-gray-300 rounded-full px-4 py-2 text-center text-lg"
                        />
                        <p className="mt-3 text-lg font-semibold text-green-700">
                          Total: $
                          {(
                            Number(form.weightKg || 0) *
                            parseFloat(selectedPackage.price)
                          ).toFixed(2)}
                        </p>
                      </div>
                    </>
                  )}

                  {/* Bread Choice Step */}
                  {currentPkgStep.isBreadChoice && (
                    <div className="flex justify-center gap-3 sm:gap-4">
                      {breadOptions.map((bread) => {
                        const selected =
                          (stepSelections[currentStep] || [])[0] === bread;
                        return (
                          <button
                            key={bread}
                            onClick={() => selectBread(bread)}
                            className={clsx(
                              "min-w-[140px] px-4 py-2 rounded-full text-xs sm:text-sm border transition-all",
                              selected
                                ? "bg-primary text-white"
                                : "border-gray-300 hover:border-primary"
                            )}
                          >
                            {bread}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Generic Category Step (snacks/mains/desserts) */}
                  {!currentPkgStep.isBreadChoice &&
                    !currentPkgStep.isWeightInput && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                        {(() => {
                          if (currentPkgStep.category === "vegetarianChoices")
                            return mainCourseChoices;
                          if (currentPkgStep.category === "paneerChoices")
                            return addOnMenu.paneerChoices;
                          if (currentPkgStep.category === "vegetarianSnacks")
                            return addOnMenu.vegetarianSnacks;
                          if (currentPkgStep.category === "dessertChoices")
                            return addOnMenu.dessertChoices;
                          return [];
                        })().map((item, idx) => (
                          <button
                            key={`${item}-${idx}`}
                            onClick={() =>
                              toggleSelection(
                                item,
                                currentPkgStep.maxSelections || 0
                              )
                            }
                            className={clsx(
                              "border rounded-full py-2 px-3 text-xs sm:text-sm transition-all",
                              (stepSelections[currentStep] || []).includes(item)
                                ? "bg-primary text-white"
                                : "border-gray-300 hover:border-primary"
                            )}
                          >
                            {item}
                          </button>
                        ))}
                      </div>
                    )}

                  {/* Selected count (only for maxSelections steps) */}
                  {!currentPkgStep.isBreadChoice &&
                    !currentPkgStep.isWeightInput && (
                      <p className="text-xs text-gray-500 text-center mt-3">
                        {stepSelections[currentStep]?.length || 0}/
                        {currentPkgStep.maxSelections} selected
                      </p>
                    )}

                  {/* Step Navigation */}
                  <div className="flex justify-between items-center mt-6">
                    {currentStep > 1 ? (
                      <button
                        onClick={prevStep}
                        className="px-5 py-2 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 text-sm"
                      >
                        ← Back
                      </button>
                    ) : (
                      <div />
                    )}

                    <button
                      onClick={nextStep}
                      disabled={!canProceedCurrent}
                      className={clsx(
                        "px-5 py-2 rounded-full text-white text-sm font-medium",
                        !canProceedCurrent
                          ? "bg-gray-300 cursor-not-allowed"
                          : "bg-[#7c1b14] hover:bg-[#a0241a]"
                      )}
                    >
                      Next →
                    </button>
                  </div>
                </div>
              )}

              {/* SUMMARY */}
              {!showCheckout && isSummaryStep && selectedPackage && (
                <div className="animate-slideIn">
                  <h3 className="text-lg sm:text-xl font-semibold text-primary mb-4 text-center">
                    Summary — {selectedPackage.name}
                  </h3>

                  <div className="bg-green-50 border border-green-100 rounded-xl p-4 mb-4 text-sm sm:text-base">
                    {!selectedPackage.isWeightBased &&
                      selectedPackage.baseItems.length > 0 && (
                        <>
                          <p className="text-green-700 font-medium mb-2 text-center">
                            Included in Every Meal
                          </p>
                          <ul className="list-disc list-inside text-gray-700 mb-3">
                            {selectedPackage.baseItems.map((i) => (
                              <li key={i}>{i}</li>
                            ))}
                          </ul>
                        </>
                      )}

                    {selectedPackage.steps.map((step, idx) => (
                      <div key={idx} className="mb-2">
                        <p className="font-medium text-gray-800">
                          {step.title}
                        </p>
                        <p className="text-gray-600">
                          {step.isWeightInput
                            ? `${form.weightKg || 0} kg @ $${
                                selectedPackage.price
                              }/kg`
                            : (stepSelections[idx + 1] || []).length
                            ? stepSelections[idx + 1].join(", ")
                            : "—"}
                        </p>
                      </div>
                    ))}

                    {/* Eco set info for non-weight-based */}
                    {!selectedPackage.isWeightBased && (
                      <div className="mt-2">
                        <p className="font-medium text-gray-800">
                          Eco Disposable Set
                        </p>
                        <p className="text-gray-600">
                          {includeEcoSet
                            ? `Yes (+$${ecoPerPerson.toFixed(2)}/person)`
                            : "No"}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-center">
                    <button
                      onClick={prevStep}
                      className="px-5 py-2 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 text-sm"
                    >
                      ← Back
                    </button>
                    <button
                      onClick={proceedToCheckout}
                      className="px-6 py-2 rounded-full bg-primary text-white hover:bg-primary/90 text-sm"
                    >
                      Confirm & Request →
                    </button>
                  </div>
                </div>
              )}

              {/* CHECKOUT FORM (UNIFIED for all packages) */}
              {showCheckout && selectedPackage && (
                <div className="animate-slideIn pb-8">
                  <h3 className="text-2xl sm:text-3xl font-bold text-center text-[#7c1b14] mb-6">
                    {selectedPackage.isWeightBased
                      ? "Delivery Form"
                      : "Catering Form"}
                  </h3>

                  {/* FORM FIELDS */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                    <div>
                      <label className="block text-sm text-[#7c1b14] mb-1">
                        Full Name
                      </label>
                      <input
                        className="w-full rounded-xl border border-[#c04a40] px-3 py-2.5 text-sm sm:text-base outline-none"
                        placeholder="Enter your full name"
                        value={form.fullName}
                        onChange={(e) =>
                          setForm({ ...form, fullName: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-[#7c1b14] mb-1">
                        Phone Number
                      </label>
                      <input
                        className="w-full rounded-xl border border-[#c04a40] px-3 py-2.5 text-sm sm:text-base outline-none focus:ring-2 focus:ring-[#c04a40]/30"
                        placeholder="Enter your phone number"
                        value={form.phone}
                        onChange={(e) =>
                          setForm({ ...form, phone: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-[#7c1b14] mb-1">
                        Delivery Location / Address
                      </label>
                      <input
                        className="w-full rounded-xl border border-[#c04a40] px-4 py-3 outline-none"
                        placeholder="Enter delivery address"
                        value={form.eventType}
                        onChange={(e) =>
                          setForm({ ...form, eventType: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-[#7c1b14] mb-1">
                        {selectedPackage.isWeightBased
                          ? "Delivery Date & Time"
                          : "Event Date & Time"}
                      </label>
                      <input
                        type="datetime-local"
                        className="w-full rounded-xl border border-[#c04a40] px-4 py-3 outline-none"
                        value={form.date}
                        onChange={(e) =>
                          setForm({ ...form, date: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-[#7c1b14] mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        className="w-full rounded-xl border border-[#c04a40] px-4 py-3 outline-none"
                        placeholder="Enter your email"
                        value={form.email}
                        onChange={(e) =>
                          setForm({ ...form, email: e.target.value })
                        }
                      />
                    </div>

                    {/* Party size only for non-weight-based */}
                    {!selectedPackage.isWeightBased && (
                      <div>
                        <label className="block text-sm text-[#7c1b14] mb-1">
                          Party Size (Min 15)
                        </label>
                        <input
                          type="number"
                          min={15}
                          className="w-full rounded-xl border border-[#c04a40] px-4 py-3 outline-none"
                          value={form.partySize}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              partySize: Math.max(
                                15,
                                Number(e.target.value || 15)
                              ),
                            })
                          }
                        />
                      </div>
                    )}

                    {/* Weight display (read-only) for Dhokla on checkout */}
                    {selectedPackage.isWeightBased && (
                      <div>
                        <label className="block text-sm text-[#7c1b14] mb-1">
                          Quantity (kg)
                        </label>
                        <input
                          type="number"
                          min={0.5}
                          step={0.5}
                          className="w-full rounded-xl border border-[#c04a40] px-4 py-3 outline-none"
                          value={form.weightKg}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              weightKg: Math.max(
                                0.5,
                                Number(e.target.value || 1)
                              ),
                            })
                          }
                        />
                      </div>
                    )}

                    {/* Optional message */}
                    <div className="sm:col-span-2">
                      <label className="block text-sm text-[#7c1b14] mb-1">
                        Additional Notes
                      </label>
                      <textarea
                        rows={3}
                        className="w-full rounded-xl border border-[#c04a40] px-4 py-3 outline-none"
                        placeholder="Anything we should know? Allergies, special instructions, gate info, etc."
                        value={form.message}
                        onChange={(e) =>
                          setForm({ ...form, message: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  {/* Eco Set checkbox only for non-weight-based */}
                  {!selectedPackage.isWeightBased && (
                    <div className="mt-4 flex items-center gap-3">
                      <input
                        id="eco-set"
                        type="checkbox"
                        checked={includeEcoSet}
                        onChange={(e) => setIncludeEcoSet(e.target.checked)}
                        className="w-5 h-5 accent-[#7c1b14]"
                      />
                      <label
                        htmlFor="eco-set"
                        className="text-sm text-gray-700"
                      >
                        Add Eco Disposable Set (+${ecoPerPerson.toFixed(2)}
                        /person)
                      </label>
                    </div>
                  )}

                  {/* TOTALS */}
                  <div className="mt-6 bg-[#fff5f4] border border-[#f0c6c2] rounded-2xl p-3 md:p-4 text-sm md:text-base">
                    {selectedPackage.isWeightBased ? (
                      <>
                        <div className="flex justify-between">
                          <span>Unit Price</span>
                          <span>
                            ${parseFloat(selectedPackage.price).toFixed(2)}/kg
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Quantity</span>
                          <span>{(form.weightKg || 0).toFixed(2)} kg</span>
                        </div>
                        <div className="flex justify-between font-semibold text-lg mt-1">
                          <span>Total</span>
                          <span>${grandTotal.toFixed(2)}</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex justify-between">
                          <span>Per person</span>
                          <span>${perPerson.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Party size</span>
                          <span>{form.partySize}</span>
                        </div>
                        <div className="flex justify-between font-semibold text-lg mt-1">
                          <span>Total</span>
                          <span>${grandTotal.toFixed(2)}</span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Checkout buttons */}
                  <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-end sm:justify-between">
                    <button
                      onClick={prevStep}
                      className="px-5 py-2 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 text-sm"
                    >
                      ← Back
                    </button>

                    <button
                      onClick={submitAll}
                      disabled={
                        loading ||
                        (!selectedPackage.isWeightBased && form.partySize < 15)
                      }
                      className={clsx(
                        "px-6 py-2 rounded-full text-white text-sm font-medium",
                        (!selectedPackage.isWeightBased &&
                          form.partySize < 15) ||
                          loading
                          ? "bg-gray-300 cursor-not-allowed"
                          : "bg-[#7c1b14] hover:bg-[#a0241a]"
                      )}
                    >
                      {loading ? "Submitting..." : "Submit Request"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ALERT MODAL */}
        {alertModal.show && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60]">
            <div className="bg-white p-6 rounded-2xl shadow-lg max-w-sm w-full text-center">
              <h3
                className={clsx(
                  "text-lg font-semibold mb-2",
                  alertModal.type === "success"
                    ? "text-green-600"
                    : "text-red-600"
                )}
              >
                {alertModal.title}
              </h3>
              <p className="text-gray-700 mb-4">{alertModal.message}</p>
              <button
                onClick={() => setAlertModal({ ...alertModal, show: false })}
                className="px-5 py-2 rounded-full bg-primary text-white hover:bg-primary/90 text-sm"
              >
                OK
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Gallery;
