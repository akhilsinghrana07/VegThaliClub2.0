"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";

const testimonials = [
  {
    name: "Aarav Mehta",
    role: "Toronto",
    image: "/images/avatars/user1.webp",
    quote:
      "Veg Thali Club made our family wedding unforgettable! Every dish was bursting with authentic flavour and beautifully presented. Guests couldn’t stop talking about the food!",
  },
  {
    name: "Priya Sharma",
    role: "Mississauga",
    image: "/images/avatars/user2.webp",
    quote:
      "Absolutely phenomenal catering service. From appetizers to desserts, every bite reflected pure passion and precision. Their team handled everything seamlessly!",
  },
  {
    name: "Rohit Patel",
    role: "Brampton",
    image: "/images/avatars/user3.webp",
    quote:
      "We booked Veg Thali Club for a corporate event and it was a hit! Professional setup, delicious vegetarian spread, and impeccable presentation. Highly recommend!",
  },
  {
    name: "Ananya Gupta",
    role: "Scarborough",
    image: "/images/avatars/user4.webp",
    quote:
      "Their catering turned our small gathering into a feast. The food was fresh, flavourful, and served with genuine warmth. The paneer dishes were everyone’s favourite!",
  },
  {
    name: "Rajesh Verma",
    role: "Etobicoke",
    image: "/images/avatars/user5.webp",
    quote:
      "Top notch service from start to finish. The attention to detail and the taste reminded me of home cooked meals with a gourmet touch.",
  },
  {
    name: "Sanya Khan",
    role: "Vaughan",
    image: "/images/avatars/user6.webp",
    quote:
      "We celebrated our anniversary with Veg Thali Club’s catering — the thali concept was elegant, the staff were courteous, and everything went off without a hitch.",
  },
  {
    name: "Deepak Singh",
    role: "Oakville",
    image: "/images/avatars/user7.webp",
    quote:
      "Incredible vegetarian spread! The variety, the taste, the service — everything exceeded our expectations. Perfect for our festive dinner event.",
  },
  // ─── New English-origin testimonials ───
  {
    name: "Emily Carter",
    role: "Downtown Toronto",
    image: "https://randomuser.me/api/portraits/women/44.jpg",
    quote:
      "We ordered from Veg Thali Club for our office lunch and it was a hit! The team loved the freshness and variety of dishes — we’ll definitely order again soon.",
  },
  {
    name: "Michael Johnson",
    role: "North York",
    image: "https://randomuser.me/api/portraits/men/32.jpg",
    quote:
      "I was amazed by how well organized the catering was. The delivery was punctual, the packaging perfect, and the flavours outstanding. Highly reliable service!",
  },
  {
    name: "Sophie Miller",
    role: "Markham",
    image: "https://randomuser.me/api/portraits/women/68.jpg",
    quote:
      "Such a wonderful experience! Every dish tasted homemade yet professional. The Veg Thali Club team made our birthday celebration so special.",
  },
  {
    name: "David Wilson",
    role: "Richmond Hill",
    image: "https://randomuser.me/api/portraits/men/15.jpg",
    quote:
      "As someone who’s not vegetarian, I was surprised at how flavourful and satisfying every item was. Veg Thali Club changed my view on vegetarian food!",
  },
  {
    name: "Olivia Brown",
    role: "Whitby",
    image: "https://randomuser.me/api/portraits/women/22.jpg",
    quote:
      "They made our family get together stress free. The coordination, timing, and the quality of every thali were impeccable. Highly recommend for any event!",
  },
  {
    name: "James Anderson",
    role: "Burlington",
    image: "https://randomuser.me/api/portraits/men/71.jpg",
    quote:
      "Fantastic service! Everything from menu planning to delivery was seamless. The flavours were rich and authentic — easily one of the best catering experiences in the GTA.",
  },
];

const Cook = () => {
  const [current, setCurrent] = useState(0);

  const prevSlide = () =>
    setCurrent((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  const nextSlide = () =>
    setCurrent((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));

  // auto-slide
  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 5000); // change every 5 seconds
    return () => clearInterval(timer);
  }, [current]);

  return (
    <section
      id="testimonials"
      className="relative py-20 bg-gradient-to-b from-white via-[#f9f9f9] to-white overflow-hidden"
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <p className="text-primary text-lg font-normal mb-3 tracking-widest uppercase">
            What Our Clients Say
          </p>
          <h2 className="text-3xl md:text-4xl font-semibold text-black">
            Words That Warm Our Hearts
          </h2>
          <p className="text-black/55 mt-4 max-w-2xl mx-auto">
            Our guests inspire us to serve better every day. Here’s what they
            have to say about their experience with Veg Thali Club Catering.
          </p>
        </div>

        <div className="relative flex items-center justify-center">
          {/* Left Button */}
          <button
            onClick={prevSlide}
            className="absolute left-4 md:left-10 z-10 bg-primary text-white p-3 rounded-full hover:bg-primary/80 transition"
          >
            <IconChevronLeft size={22} />
          </button>

          <AnimatePresence initial={false} mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, x: 100, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -100, scale: 0.8 }}
              transition={{ duration: 0.8 }}
              className="bg-white shadow-lg rounded-3xl max-w-3xl w-full mx-auto text-center px-8 py-10 md:px-14 relative overflow-hidden border border-gray-100"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent pointer-events-none" />
              <div className="flex flex-col items-center space-y-6">
                {/* <Image
                  src={testimonials[current].image}
                  alt={testimonials[current].name}
                  width={100}
                  height={100}
                  className="rounded-full shadow-md object-cover"
                /> */}
                <p className="text-lg italic text-black/80 leading-relaxed max-w-xl">
                  “{testimonials[current].quote}”
                </p>
                <div className="text-center">
                  <h4 className="text-xl font-semibold text-black">
                    {testimonials[current].name}
                  </h4>
                  <p className="text-primary text-sm font-medium">
                    {testimonials[current].role}
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Right Button */}
          <button
            onClick={nextSlide}
            className="absolute right-4 md:right-10 z-10 bg-primary text-white p-3 rounded-full hover:bg-primary/80 transition"
          >
            <IconChevronRight size={22} />
          </button>
        </div>

        {/* Dots Indicator */}
        <div className="flex justify-center gap-2 mt-8">
          {testimonials.map((_, idx) => (
            <span
              key={idx}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                idx === current ? "bg-primary scale-110" : "bg-gray-300"
              }`}
            ></span>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Cook;
