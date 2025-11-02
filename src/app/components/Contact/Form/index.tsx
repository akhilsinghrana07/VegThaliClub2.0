"use client";
import React, { useState, useEffect } from "react";

const ContactForm = () => {
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    phnumber: "",
    datetime: "",
    people: "",
    instructions: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [showThanks, setShowThanks] = useState(false);
  const [loader, setLoader] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);

  useEffect(() => {
    const isValid = Object.values(formData).every(
      (value) => value.trim() !== ""
    );
    setIsFormValid(isValid);
  }, [formData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    // Limit instructions to 200 characters
    if (name === "instructions" && value.length > 200) return;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      fullname: "",
      email: "",
      phnumber: "",
      datetime: "",
      people: "",
      instructions: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoader(true);

    try {
      const response = await fetch(
        "https://formsubmit.co/ajax/bhainirav772@gmail.com",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            FullName: formData.fullname,
            Email: formData.email,
            PhoneNo: formData.phnumber,
            DateTime: formData.datetime,
            People: formData.people,
            Instructions: formData.instructions,
          }),
        }
      );

      const data = await response.json();
      if (data.success) {
        setSubmitted(true);
        setShowThanks(true);
        resetForm();
        setTimeout(() => setShowThanks(false), 5000);
      }
    } catch (error: any) {
      console.error("Submission error:", error.message);
    } finally {
      setLoader(false);
    }
  };

  return (
    <section id="contact" className="scroll-mt-20 py-16">
      <div className="container">
        <p className="text-primary text-lg font-semibold mb-3 tracking-widest uppercase text-center">
          Contact Us
        </p>
        <h2 className="mb-9 text-3xl font-bold tracking-tight text-center">
          Order Catering for Business Events or Occasions
        </h2>

        <div className="relative border border-gray-200 bg-white shadow-md px-6 py-8 rounded-3xl">
          <form
            onSubmit={handleSubmit}
            className="flex flex-wrap w-full justify-between gap-y-6"
          >
            {/* Fullname */}
            <div className="w-full md:w-[48%]">
              <label
                htmlFor="fullname"
                className="pb-2 block text-base font-medium"
              >
                Full Name
              </label>
              <input
                id="fullname"
                type="text"
                name="fullname"
                value={formData.fullname}
                onChange={handleChange}
                placeholder="John Doe"
                className="w-full text-base px-4 py-2.5 border rounded-2xl focus:border-primary focus:outline-none transition-all duration-300"
              />
            </div>

            {/* Email */}
            <div className="w-full md:w-[48%]">
              <label
                htmlFor="email"
                className="pb-2 block text-base font-medium"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john.doe@example.com"
                className="w-full text-base px-4 py-2.5 border rounded-2xl focus:border-primary focus:outline-none transition-all duration-300"
              />
            </div>

            {/* Phone */}
            <div className="w-full md:w-[48%]">
              <label
                htmlFor="phnumber"
                className="pb-2 block text-base font-medium"
              >
                Phone Number
              </label>
              <input
                id="phnumber"
                type="tel"
                name="phnumber"
                value={formData.phnumber}
                onChange={handleChange}
                placeholder="+1 (234) 567-890"
                className="w-full text-base px-4 py-2.5 border rounded-2xl focus:border-primary focus:outline-none transition-all duration-300"
              />
            </div>

            {/* Date & Time */}
            <div className="w-full md:w-[48%]">
              <label
                htmlFor="datetime"
                className="pb-2 block text-base font-medium"
              >
                Preferred Date & Time of food delivery
              </label>
              <input
                id="datetime"
                type="datetime-local"
                name="datetime"
                value={formData.datetime}
                onChange={handleChange}
                className="w-full text-base px-4 py-2.5 border rounded-2xl focus:border-primary focus:outline-none transition-all duration-300"
              />
            </div>

            {/* Number of People */}
            <div className="w-full md:w-[48%]">
              <label
                htmlFor="people"
                className="pb-2 block text-base font-medium"
              >
                Number of Guests
              </label>
              <input
                id="people"
                type="number"
                name="people"
                min="1"
                max="1000"
                value={formData.people}
                onChange={handleChange}
                placeholder="2"
                className="w-full text-base px-4 py-2.5 border rounded-2xl focus:border-primary focus:outline-none transition-all duration-300"
              />
            </div>

            {/* Instructions */}
            <div className="w-full">
              <label
                htmlFor="instructions"
                className="pb-2 block text-base font-medium"
              >
                Special Instructions{" "}
                <span className="text-sm text-gray-500">(max 200 chars)</span>
              </label>
              <textarea
                id="instructions"
                name="instructions"
                value={formData.instructions}
                onChange={handleChange}
                placeholder="Tell us if you have any special requests, dietary preferences, or seating needs..."
                className="w-full h-32 resize-none text-base px-4 py-3 border rounded-2xl focus:border-primary focus:outline-none transition-all duration-300"
              />
              <div className="text-right text-sm text-gray-500 mt-1">
                {formData.instructions.length}/200
              </div>
            </div>

            {/* Submit */}
            <div className="w-full text-center">
              <button
                type="submit"
                disabled={!isFormValid || loader}
                className={`border px-10 text-lg font-medium py-3 rounded-full transition-all duration-300 
                  ${
                    !isFormValid || loader
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-primary text-white hover:bg-transparent hover:text-primary border-primary cursor-pointer"
                  }`}
              >
                {loader ? "Sending..." : "Submit"}
              </button>
            </div>
          </form>

          {/* Thanks message */}
          {showThanks && (
            <div className="absolute top-[-2rem] left-1/2 -translate-x-1/2 bg-primary text-white px-5 py-2 rounded-full shadow-lg flex items-center gap-2 animate-fadeIn">
              Thank you! We’ll get back to you shortly.
              <div className="w-3 h-3 rounded-full animate-spin border-2 border-solid border-white border-t-transparent"></div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ContactForm;
