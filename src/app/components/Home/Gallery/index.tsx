"use client";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";

/* -------------------- Types -------------------- */
type StepConfig = {
  title: string;
  category?: keyof AddOnMenuType;
  maxSelections?: number;
  isBreadChoice?: boolean;
  isWeightInput?: boolean; // NEW for Dhokla
};

type PackageType = {
  name: string;
  price: string;
  src: string;
  description: string;
  description2?: string; // ✅ Optional: used only for Khaman/Dhokla
  baseItems: string[];
  steps: StepConfig[];
  isWeightBased?: boolean;
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
  eventType: string;
  date: string;
  email: string;
  partySize: number;
  message: string;
  weightKg?: number; // NEW for Gujju special
};

/* -------------------- IndexedDB helpers -------------------- */
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

/* -------------------- Component -------------------- */
const Gallery = () => {
  const [isOrderOpen, setIsOrderOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedPackage, setSelectedPackage] = useState<PackageType | null>(
    null
  );
  const [stepSelections, setStepSelections] = useState<
    Record<number, string[]>
  >({});
  const [includeEcoSet, setIncludeEcoSet] = useState(false);
  const [basePerPerson, setBasePerPerson] = useState<number>(0);
  const ecoPerPerson = 1.49;
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

  /* -------------------- Menu Data -------------------- */
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

  const mainCourseChoices = useMemo(
    () => [...addOnMenu.vegetarianChoices, ...addOnMenu.paneerChoices],
    []
  );

  /* -------------------- Package List -------------------- */
  const galleryImages: PackageType[] = [
    {
      name: "2 Veg Snacks",
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
      name: "3 Snacks Package",
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
        "Surati Nylon Khaman is a soft, spongy delicacy made from gram flour, perfectly balanced with a subtle sweetness and tang, lightly infused with mustard seeds, green chilies, and fresh coriander for an authentic Gujarati flavor experience.",
      baseItems: [],
      steps: [
        {
          title: "Enter quantity in kilograms",
          isWeightInput: true,
        },
      ],
      isWeightBased: true,
    },
  ];

  /* -------------------- Derived -------------------- */
  const currentPkgStep: StepConfig | null =
    selectedPackage?.steps[currentStep - 1] ?? null;

  const isSummaryStep =
    selectedPackage && currentStep > selectedPackage.steps.length;

  const perPerson = includeEcoSet
    ? basePerPerson + ecoPerPerson
    : basePerPerson;
  const subtotal = selectedPackage?.isWeightBased
    ? form.weightKg! * parseFloat(selectedPackage.price)
    : perPerson * (form.partySize || 15);
  const grandTotal = subtotal;

  /* -------------------- Persistence -------------------- */
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
      if (data.currentStep) setCurrentStep(data.currentStep);
      if (data.stepSelections) setStepSelections(data.stepSelections);
      if (typeof data.includeEcoSet === "boolean")
        setIncludeEcoSet(data.includeEcoSet);
      if (typeof data.basePerPerson === "number")
        setBasePerPerson(data.basePerPerson);
      if (data.form) setForm(data.form);
      if (data.showCheckout) setShowCheckout(true);
    })();
  }, []);

  /* -------------------- Handlers -------------------- */
  const openOrder = (pkg: PackageType) => {
    setSelectedPackage(pkg);
    setIsOrderOpen(true);
    setCurrentStep(1);
    setStepSelections({});
    setIncludeEcoSet(false);
    setShowCheckout(false);
    setBasePerPerson(parseFloat(pkg.price));
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
      if (current.includes(item))
        return { ...prev, [currentStep]: current.filter((i) => i !== item) };
      else if (current.length < limit)
        return { ...prev, [currentStep]: [...current, item] };
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
    else setCurrentStep(totalSteps + 1);
  };

  const prevStep = () => {
    if (showCheckout) {
      setShowCheckout(false);
      return;
    }
    if (currentStep > 1) setCurrentStep((s) => s - 1);
  };

  const submitAll = async () => {
    if (!selectedPackage) return;

    if (
      !selectedPackage.isWeightBased &&
      (!form.fullName || !form.phone || !form.email || !form.date)
    ) {
      setAlertModal({
        show: true,
        title: "Incomplete Form",
        message: "Please fill in Full Name, Phone, Email, and Date.",
        type: "error",
      });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/send-catering-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          package: selectedPackage.name,
          baseItems: selectedPackage.baseItems,
          steps: selectedPackage.steps.map((s, idx) => ({
            title: s.title,
            selections: stepSelections[idx + 1] || [],
          })),
          includeEcoSet,
          perPerson,
          subtotal,
          grandTotal,
          form,
        }),
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
    } catch {
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

  const proceedToCheckout = () => setShowCheckout(true);

  /* -------------------- UI -------------------- */
  /* -------------------- UI -------------------- */
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
                  // ✅ Special info card for Nylon Khaman
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
              className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl sm:max-h-[90vh] overflow-y-auto p-4 sm:p-6 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={closeOrder}
                className="absolute top-3 right-4 text-gray-500 hover:text-primary text-2xl"
              >
                ✕
              </button>

              {/* DHOKLA PACKAGE — SPECIAL CASE */}
              {/* DHOKLA PACKAGE — SPECIAL CASE */}
              {selectedPackage.isWeightBased ? (
                <div className="text-center py-8">
                  <h3 className="text-xl sm:text-2xl font-bold text-[#7c1b14] mb-2">
                    {selectedPackage.name}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    ${selectedPackage.price}/kg — Soft, spongy & delicious!
                  </p>

                  {/* About this Dish */}
                  <div className="bg-green-50 border border-green-100 rounded-xl p-3 mb-4 text-left max-w-md mx-auto">
                    <p className="text-green-700 text-sm font-medium mb-1">
                      About this Dish:
                    </p>
                    <p className="text-gray-700 text-sm leading-snug">
                      {selectedPackage.description2}
                    </p>
                  </div>

                  {/* Quantity */}
                  <div className="mb-6">
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
                          weightKg: Math.max(0.5, Number(e.target.value || 1)),
                        })
                      }
                      className="w-32 mx-auto border border-gray-300 rounded-full px-4 py-2 text-center text-lg"
                    />
                    <p className="mt-3 text-lg font-semibold text-green-700">
                      Total: $
                      {(
                        form.weightKg! * parseFloat(selectedPackage.price)
                      ).toFixed(2)}
                    </p>
                  </div>

                  {/* DELIVERY FORM */}
                  <div className="text-left max-w-2xl mx-auto">
                    <h4 className="text-lg font-semibold text-[#7c1b14] mb-3 text-center">
                      Delivery Details
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-[#7c1b14] mb-1">
                          Full Name
                        </label>
                        <input
                          className="w-full rounded-xl border border-[#c04a40] px-4 py-3 outline-none"
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
                          className="w-full rounded-xl border border-[#c04a40] px-4 py-3 outline-none"
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
                          Delivery Date & Time
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
                    </div>

                    {/* SUBMIT BUTTON */}
                    <div className="text-center mt-8">
                      <button
                        onClick={submitAll}
                        disabled={loading}
                        className={clsx(
                          "px-8 py-2 rounded-full text-white font-medium text-sm",
                          loading
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-[#7c1b14] hover:bg-[#a0241a]"
                        )}
                      >
                        {loading ? "Submitting..." : "Submit Order"}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {/* PROGRESS DOTS */}
                  <div className="flex justify-center gap-2 mb-6 mt-6 sm:mt-0">
                    {Array.from({
                      length: selectedPackage.steps.length + 2,
                    }).map((_, idx) => (
                      <div
                        key={idx}
                        className={clsx(
                          "w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full",
                          showCheckout
                            ? idx + 1 === selectedPackage.steps.length + 2
                              ? "bg-primary scale-125"
                              : "bg-gray-300"
                            : currentStep >= idx + 1
                            ? "bg-primary scale-125"
                            : "bg-gray-300"
                        )}
                      />
                    ))}
                  </div>

                  {/* STEP / SUMMARY / CHECKOUT UI */}
                  {!showCheckout && currentPkgStep && !isSummaryStep && (
                    <div className="animate-slideIn">
                      <h3 className="text-lg sm:text-xl font-semibold text-primary mb-4 text-center">
                        {currentPkgStep.title}
                      </h3>
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
                                currentPkgStep.maxSelections!
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
                      <p className="text-xs text-gray-500 text-center mt-3">
                        {stepSelections[currentStep]?.length || 0}/
                        {currentPkgStep.maxSelections} selected
                      </p>
                    </div>
                  )}

                  {/* SUMMARY */}
                  {!showCheckout && isSummaryStep && (
                    <div className="animate-slideIn">
                      <h3 className="text-lg sm:text-xl font-semibold text-primary mb-4 text-center">
                        Summary — {selectedPackage.name}
                      </h3>
                      <div className="bg-green-50 border border-green-100 rounded-xl p-4 mb-4 text-sm sm:text-base">
                        <p className="text-green-700 font-medium mb-2 text-center">
                          Included in Every Meal
                        </p>
                        <ul className="list-disc list-inside text-gray-700 mb-3">
                          {selectedPackage.baseItems.map((i) => (
                            <li key={i}>{i}</li>
                          ))}
                        </ul>
                        {selectedPackage.steps.map((step, idx) => (
                          <div key={idx} className="mb-2">
                            <p className="font-medium text-gray-800">
                              {step.title}
                            </p>
                            <p className="text-gray-600">
                              {(stepSelections[idx + 1] || []).length
                                ? stepSelections[idx + 1].join(", ")
                                : "—"}
                            </p>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-end">
                        <button
                          onClick={proceedToCheckout}
                          className="px-6 py-2 rounded-full bg-primary text-white hover:bg-primary/90 text-sm"
                        >
                          Confirm & Request →
                        </button>
                      </div>
                    </div>
                  )}

                  {/* CHECKOUT FORM */}
                  {showCheckout && (
                    <div className="animate-slideIn pb-8">
                      <h3 className="text-2xl sm:text-3xl font-bold text-center text-[#7c1b14] mb-6">
                        Catering Form
                      </h3>
                      {/* FORM FIELDS */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-[#7c1b14] mb-1">
                            Full Name
                          </label>
                          <input
                            className="w-full rounded-xl border border-[#c04a40] px-4 py-3 outline-none"
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
                            className="w-full rounded-xl border border-[#c04a40] px-4 py-3 outline-none"
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
                            Event Date & Time
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
                      </div>

                      {/* TOTALS */}
                      <div className="mt-6 bg-[#fff5f4] border border-[#f0c6c2] rounded-2xl p-4 text-sm sm:text-base">
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
                      </div>

                      <div className="mt-6 flex justify-end">
                        <button
                          onClick={submitAll}
                          disabled={loading || form.partySize < 15}
                          className={clsx(
                            "px-6 py-2 rounded-full text-white text-sm font-medium",
                            form.partySize < 15 || loading
                              ? "bg-gray-300 cursor-not-allowed"
                              : "bg-[#7c1b14] hover:bg-[#a0241a]"
                          )}
                        >
                          {loading ? "Submitting..." : "Submit Request"}
                        </button>
                      </div>
                    </div>
                  )}
                </>
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
