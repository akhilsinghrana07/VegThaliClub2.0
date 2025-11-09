"use client";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import Masonry from "react-masonry-css";
import clsx from "clsx";

/* -------------------- Types -------------------- */
type StepConfig = {
  title: string;
  category?: keyof AddOnMenuType;
  maxSelections?: number;
  isBreadChoice?: boolean;
};

type PackageType = {
  name: string;
  price: string; // per person
  src: string;
  description: string;
  baseItems: string[];
  steps: StepConfig[];
};

type AddOnMenuType = {
  vegetarianSnacks: string[];
  vegetarianChoices: string[];
  chineseSnacks: string[];
  paneerChoices: string[];
  dessertChoices: string[];
};

type FormDataType = {
  fullName: string;
  phone: string;
  eventType: string; // location / type
  date: string; // yyyy-mm-dd
  email: string;
  partySize: number;
  message: string;
};

/* -------------------- Small IndexedDB helper -------------------- */
const DB_NAME = "catering-db";
const DB_STORE = "catering-store";
const DB_KEY = "in-progress";

function idbOpen(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(DB_STORE)) {
        db.createObjectStore(DB_STORE);
      }
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
    const req = tx.objectStore(DB_STORE).delete(key);
    req.onsuccess = () => res();
    req.onerror = () => rej(req.error);
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

  // Step index -> string[]
  const [stepSelections, setStepSelections] = useState<
    Record<number, string[]>
  >({});
  const [includeEcoSet, setIncludeEcoSet] = useState(false);

  // Pricing
  const [basePerPerson, setBasePerPerson] = useState<number>(0); // from package
  const ecoPerPerson = 0.99;
  const HST = 0.13;

  // Form + total section
  const [showCheckout, setShowCheckout] = useState(false);
  const [form, setForm] = useState<FormDataType>({
    fullName: "",
    phone: "",
    eventType: "",
    date: "",
    email: "",
    partySize: 1,
    message: "",
  });

  /* -------------------- Data -------------------- */
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

  // Combine paneer + veg mains for any step that uses vegetarianChoices
  const mainCourseChoices = useMemo(
    () => [...addOnMenu.vegetarianChoices, ...addOnMenu.paneerChoices],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const galleryImages: PackageType[] = [
    {
      name: "Vegetarian",
      price: "16.99",
      src: "/images/res/1.jpg",
      description: "Pick 3 Main Dishes & 1 Dessert",
      baseItems: ["Boondi Raita", "Jeera Rice", "Salad", "Roti or Naan"],
      steps: [
        {
          title: "Select 3 Main Dishes (Paneer or Veg)",
          category: "vegetarianChoices",
          maxSelections: 3,
        },
        {
          title: "Select 1 Dessert",
          category: "dessertChoices",
          maxSelections: 1,
        },
      ],
    },
    {
      name: "Snacks & Main Course",
      price: "25.00",
      src: "/images/res/2.jpg",
      description:
        "Pick 2 Veg Snacks, 1 Main Dish (Paneer or Veg), 2 Sweets & Bread",
      baseItems: ["Boondi Raita", "Jeera Rice", "Salad"],
      steps: [
        {
          title: "Pick 2 Veg Snacks",
          category: "vegetarianSnacks",
          maxSelections: 2,
        },
        {
          title: "Pick 1 Main Dish (Paneer or Veg)",
          category: "vegetarianChoices",
          maxSelections: 1,
        },
        {
          title: "Pick 2 Sweets",
          category: "dessertChoices",
          maxSelections: 2,
        },
        { title: "Choose Bread Option", isBreadChoice: true },
      ],
    },
    {
      name: "Premium Vegetarian",
      price: "30.00",
      src: "/images/res/3.jpg",
      description:
        "Pick 4 Veg Snacks, 4 Main Course (Paneer or Veg) & 1 Dessert",
      baseItems: ["Rice", "Raita", "Salad", "Plain Naan or Tandoori Naan"],
      steps: [
        {
          title: "Pick 4 Veg Snacks",
          category: "vegetarianSnacks",
          maxSelections: 4,
        },
        {
          title: "Pick 4 Main Dishes (Paneer or Veg)",
          category: "vegetarianChoices",
          maxSelections: 4,
        },
        {
          title: "Pick 1 Dessert",
          category: "dessertChoices",
          maxSelections: 1,
        },
      ],
    },
  ];

  /* -------------------- Derived -------------------- */
  const currentPkgStep: StepConfig | null =
    selectedPackage?.steps[currentStep - 1] ?? null;

  const isSummaryStep =
    selectedPackage && currentStep > selectedPackage.steps.length;

  const perPerson = useMemo(
    () => (includeEcoSet ? basePerPerson + 0.99 : basePerPerson),
    [basePerPerson, includeEcoSet]
  );
  const subtotal = useMemo(
    () => perPerson * (form.partySize || 1),
    [perPerson, form.partySize]
  );
  const tax = useMemo(() => subtotal * HST, [subtotal]);
  const grandTotal = useMemo(() => subtotal + tax, [subtotal, tax]);

  /* -------------------- Persistence -------------------- */
  // Save to IDB whenever key state changes
  useEffect(() => {
    const payload = {
      selectedPackageName: selectedPackage?.name ?? null,
      currentStep,
      stepSelections,
      includeEcoSet,
      basePerPerson,
      form,
      showCheckout,
    };
    idbSet(DB_KEY, payload).catch(() => {});
  }, [
    selectedPackage,
    currentStep,
    stepSelections,
    includeEcoSet,
    basePerPerson,
    form,
    showCheckout,
  ]);

  // Load from IDB on mount
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      : (stepSelections[currentStep]?.length || 0) >=
        (currentPkgStep.maxSelections || 0));

  const nextStep = () => {
    if (!selectedPackage) return;
    const totalSteps = selectedPackage.steps.length; // dynamic
    if (currentStep < totalSteps) {
      setCurrentStep((s) => s + 1);
    } else {
      // to summary
      setCurrentStep(totalSteps + 1);
    }
  };

  const prevStep = () => {
    if (showCheckout) {
      setShowCheckout(false);
      return;
    }
    if (currentStep > 1) setCurrentStep((s) => s - 1);
  };

  const toggleEcoOption = () => setIncludeEcoSet((prev) => !prev);

  const proceedToCheckout = () => {
    setShowCheckout(true);
  };

  const onFormChange = (key: keyof FormDataType, val: string | number) =>
    setForm((f) => ({ ...f, [key]: val } as FormDataType));

  const submitAll = async () => {
    if (!selectedPackage) return;
    // Basic validation
    if (
      !form.fullName ||
      !form.phone ||
      !form.email ||
      !form.date ||
      !form.partySize
    ) {
      alert("Please fill in Full Name, Phone, Email, Date and Party Size.");
      return;
    }
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
          tax,
          grandTotal,
          form,
        }),
      });
      if (!res.ok) throw new Error("Failed to send. Please try again.");
      alert(
        "Request submitted! We’ll reach out shortly. A copy has been sent to admin."
      );
      await idbClear(DB_KEY).catch(() => {});
      closeOrder();
    } catch (e: any) {
      alert(e?.message || "Something went wrong.");
    }
  };

  /* -------------------- UI -------------------- */
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
                {/* Image */}
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

                {/* Body */}
                <div className="p-6">
                  <p className="text-lg font-semibold text-gray-900 mb-3">
                    {pkg.description}
                  </p>
                  <div className="bg-green-50 border border-green-100 rounded-xl p-3 mb-3">
                    <p className="text-green-700 text-sm font-medium mb-2">
                      Included in Every Meal:
                    </p>
                    <ul className="text-gray-700 text-sm space-y-1">
                      {pkg.baseItems.map((i) => (
                        <li key={i}>• {i}</li>
                      ))}
                    </ul>
                  </div>

                  <p className="text-primary text-sm font-medium mt-2">
                    Tap anywhere to customize →
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
              className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl p-6 relative overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={closeOrder}
                className="absolute top-3 right-3 text-gray-500 hover:text-primary text-2xl"
              >
                ✕
              </button>

              {/* Step Dots: steps + summary + checkout */}
              <div className="flex justify-center gap-2 mb-6">
                {Array.from({
                  length: selectedPackage.steps.length + 2,
                }).map((_, idx) => (
                  <div
                    key={idx}
                    className={clsx(
                      "w-3 h-3 rounded-full",
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

              {/* Steps */}
              {!showCheckout &&
                currentPkgStep &&
                !currentPkgStep.isBreadChoice && (
                  <div className="animate-slideIn">
                    <h3 className="text-xl font-semibold text-primary mb-3 text-center">
                      {currentPkgStep.title}
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {(currentPkgStep.category === "vegetarianChoices"
                        ? mainCourseChoices
                        : addOnMenu[currentPkgStep.category!]
                      ).map((item) => (
                        <button
                          key={item}
                          onClick={() =>
                            toggleSelection(item, currentPkgStep.maxSelections!)
                          }
                          className={clsx(
                            "border rounded-full py-2 px-3 text-sm transition-all",
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

              {/* Bread step */}
              {!showCheckout && currentPkgStep?.isBreadChoice && (
                <div className="animate-slideIn text-center">
                  <h3 className="text-xl font-semibold text-primary mb-3">
                    Choose Your Bread
                  </h3>
                  <div className="flex justify-center gap-4">
                    {["Roti", "Tandoori Naan"].map((b) => (
                      <button
                        key={b}
                        onClick={() => selectBread(b)}
                        className={clsx(
                          "border rounded-full px-5 py-2 text-sm transition-all",
                          (stepSelections[currentStep] || []).includes(b)
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

              {/* Summary */}
              {!showCheckout && isSummaryStep && (
                <div className="animate-slideIn">
                  <h3 className="text-xl font-semibold text-primary mb-4 text-center">
                    Summary — {selectedPackage.name}
                  </h3>
                  <div className="bg-green-50 border border-green-100 rounded-xl p-4 mb-4">
                    <p className="text-green-700 text-sm font-medium mb-2 text-center">
                      Included in Every Meal
                    </p>
                    <ul className="text-gray-700 text-sm space-y-1 list-disc list-inside mb-4">
                      {selectedPackage.baseItems.map((i) => (
                        <li key={i}>{i}</li>
                      ))}
                    </ul>

                    {selectedPackage.steps.map((step, idx) => (
                      <div key={idx} className="mb-2">
                        <p className="font-medium text-gray-800 text-sm">
                          {step.title}
                        </p>
                        <p className="text-gray-600 text-sm">
                          {(stepSelections[idx + 1] || []).length
                            ? stepSelections[idx + 1].join(", ")
                            : "—"}
                        </p>
                      </div>
                    ))}

                    {/* Options */}
                    <div className="mt-4 border border-green-200 bg-green-50 rounded-xl p-3 flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="ecoSet"
                        checked={includeEcoSet}
                        onChange={toggleEcoOption}
                        className="mt-1 accent-green-600 cursor-pointer"
                      />
                      <label htmlFor="ecoSet" className="text-sm text-gray-700">
                        <strong>Eco-friendly disposable set</strong> — plates,
                        glasses, spoons, forks{" "}
                        <span className="text-green-700 font-semibold">
                          (+$0.99/person)
                        </span>
                      </label>
                    </div>

                    {/* Price per person (before party size) */}
                    <div className="mt-4 text-sm text-gray-700">
                      <div className="flex justify-between">
                        <span>Base price / person</span>
                        <span>${basePerPerson.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Eco set / person</span>
                        <span>
                          {includeEcoSet
                            ? `+$${ecoPerPerson.toFixed(2)}`
                            : "$0.00"}
                        </span>
                      </div>
                      <div className="flex justify-between font-semibold">
                        <span>Total / person</span>
                        <span>${perPerson.toFixed(2)}</span>
                      </div>
                    </div>
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

              {/* Checkout / Form */}
              {showCheckout && (
                <div className="animate-slideIn">
                  <h3 className="text-3xl font-bold text-center text-[#7c1b14] mb-6">
                    Catering form
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-[#7c1b14] mb-1">
                        Full Name
                      </label>
                      <input
                        className="w-full rounded-xl border border-[#c04a40] px-4 py-3 outline-none"
                        placeholder="Enter Your Full Name"
                        value={form.fullName}
                        onChange={(e) =>
                          onFormChange("fullName", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-[#7c1b14] mb-1">
                        Phone Number
                      </label>
                      <input
                        className="w-full rounded-xl border border-[#c04a40] px-4 py-3 outline-none"
                        placeholder="Enter Your phone Number"
                        value={form.phone}
                        onChange={(e) => onFormChange("phone", e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-[#7c1b14] mb-1">
                        Event Type
                      </label>
                      <input
                        className="w-full rounded-xl border border-[#c04a40] px-4 py-3 outline-none"
                        placeholder="Enter The Location"
                        value={form.eventType}
                        onChange={(e) =>
                          onFormChange("eventType", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-[#7c1b14] mb-1">
                        Date of Event
                      </label>
                      <input
                        type="date"
                        className="w-full rounded-xl border border-[#c04a40] px-4 py-3 outline-none"
                        value={form.date}
                        onChange={(e) => onFormChange("date", e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-[#7c1b14] mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        className="w-full rounded-xl border border-[#c04a40] px-4 py-3 outline-none"
                        placeholder="Enter Your Email Address"
                        value={form.email}
                        onChange={(e) => onFormChange("email", e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-[#7c1b14] mb-1">
                        Party Size (Total People)
                      </label>
                      <input
                        type="number"
                        min={1}
                        className="w-full rounded-xl border border-[#c04a40] px-4 py-3 outline-none"
                        value={form.partySize}
                        onChange={(e) =>
                          onFormChange(
                            "partySize",
                            Math.max(1, Number(e.target.value || 1))
                          )
                        }
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm text-[#7c1b14] mb-1">
                        Message
                      </label>
                      <textarea
                        rows={4}
                        className="w-full rounded-xl border border-[#c04a40] px-4 py-3 outline-none"
                        placeholder="Please let us know any other information we should know"
                        value={form.message}
                        onChange={(e) =>
                          onFormChange("message", e.target.value)
                        }
                      />
                    </div>
                  </div>

                  {/* Totals */}
                  <div className="mt-6 bg-[#fff5f4] border border-[#f0c6c2] rounded-2xl p-4">
                    <div className="flex justify-between text-sm">
                      <span>Per person</span>
                      <span>${perPerson.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Party size</span>
                      <span>{form.partySize}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>HST (Ontario 13%)</span>
                      <span>${tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-lg mt-1">
                      <span>Total</span>
                      <span>${grandTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-between">
                    <button
                      onClick={prevStep}
                      className="px-5 py-2 border border-gray-300 rounded-full hover:bg-gray-100 text-sm"
                    >
                      Back
                    </button>
                    <button
                      onClick={submitAll}
                      className="px-6 py-2 bg-[#7c1b14] text-white rounded-full hover:opacity-90 text-sm"
                    >
                      Submit
                    </button>
                  </div>
                </div>
              )}

              {/* Footer nav for steps (hidden on checkout) */}
              {!showCheckout && (
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

                  {!isSummaryStep ? (
                    <button
                      onClick={nextStep}
                      disabled={!canProceedCurrent}
                      className={clsx(
                        "px-5 py-2 rounded-full text-sm transition-all",
                        canProceedCurrent
                          ? "bg-primary text-white hover:bg-primary/90"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      )}
                    >
                      Next
                    </button>
                  ) : (
                    <button
                      onClick={proceedToCheckout}
                      className="px-5 py-2 bg-primary text-white rounded-full hover:bg-primary/90 text-sm"
                    >
                      Confirm & Request
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Gallery;
