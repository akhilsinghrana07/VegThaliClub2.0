"use client";

import React, { FC, useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import Logo from "../Header/Logo";
import { FooterLinkType } from "@/app/types/footerlink";

const Footer: FC = () => {
  const [footerlink, SetFooterlink] = useState<FooterLinkType[]>([]);
  const [showTerms, setShowTerms] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/data");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        SetFooterlink(data.FooterLinkData);
      } catch (error) {
        console.error("Error fetching services:", error);
      }
    };
    fetchData();
  }, []);

  return (
    <>
      <footer className="pt-8">
        <div className="container">
          <div className="grid grid-cols-1 sm:grid-cols-6 lg:gap-20 md:gap-24 sm:gap-12 gap-12 pb-10">
            {/* Logo + About */}
            <div className="col-span-2">
              <Logo />
              <p className="text-sm font-medium text-grey my-5 max-w-70%">
                Experience authentic vegetarian catering made easy — order from
                top local kitchens, and we’ll deliver your thali right to you.
              </p>
              {/* <div className="flex gap-6 items-center">
                <Link
                  href="#"
                  className="group bg-white hover:bg-primary rounded-full shadow-xl p-3"
                >
                  <Icon
                    icon="fa6-brands:facebook-f"
                    width="16"
                    height="16"
                    className=" group-hover:text-white text-black"
                  />
                </Link>
                <Link
                  href="#"
                  className="group bg-white hover:bg-primary rounded-full shadow-xl p-3"
                >
                  <Icon
                    icon="fa6-brands:instagram"
                    width="16"
                    height="16"
                    className=" group-hover:text-white text-black"
                  />
                </Link>
                <Link
                  href="#"
                  className="group bg-white hover:bg-primary rounded-full shadow-xl p-3"
                >
                  <Icon
                    icon="fa6-brands:x-twitter"
                    width="16"
                    height="16"
                    className=" group-hover:text-white text-black"
                  />
                </Link>
              </div> */}
            </div>

            {/* Footer Links */}
            <div className="col-span-2">
              <div className="flex gap-20">
                {footerlink.map((product, i) => (
                  <div key={i} className="group relative col-span-2">
                    <p className="text-black text-xl font-semibold mb-9">
                      {product.section}
                    </p>
                    <ul>
                      {product.links.map((item, i) => (
                        <li key={i} className="mb-3">
                          <Link
                            href={item.href}
                            className="text-black/60 hover:text-black text-base font-normal mb-6"
                          >
                            {item.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Info */}
            <div className="col-span-2 sm:col-span-6 md:col-span-2">
              <div className="flex flex-col gap-5">
                <div className="flex">
                  <Icon
                    icon="solar:point-on-map-perspective-bold"
                    className="text-primary text-3xl lg:text-2xl inline-block me-2"
                  />
                  <p className="text-black text-base">Yash Shah</p>
                </div>
                <Link href="tel:+1(909)235-9814">
                  <div className="flex">
                    <Icon
                      icon="solar:phone-bold"
                      className="text-primary text-3xl lg:text-2xl inline-block me-2"
                    />
                    <p className="text-black/60 hover:text-black text-base">
                      +1 (437) 987-0230
                    </p>
                  </div>
                </Link>
                <Link href="mailto:info@vegthaliclub.com">
                  <div className="flex">
                    <Icon
                      icon="solar:mailbox-bold"
                      className="text-primary text-3xl lg:text-2xl inline-block me-2"
                    />
                    <p className="text-black/60 hover:text-black text-base">
                      vegthaliclub@gmail.com
                    </p>
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="border-t border-grey/15 py-5 flex flex-col sm:flex-row justify-between sm:items-center gap-5">
            <p className="text-sm text-black/70">
              © 2025 Veg Thali Club. All Rights Reserved.
            </p>

            <div>
              <Link
                href="#"
                className="text-sm text-black/70 px-5 border-r border-grey/15 hover:text-primary hover:underline"
              >
                Privacy Policy
              </Link>
              <button
                onClick={() => setShowTerms(true)}
                className="text-sm text-black/70 px-5 hover:text-primary hover:underline"
              >
                Terms & Conditions
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Modal for Terms & Conditions */}
      {showTerms && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white max-w-3xl w-full rounded-3xl shadow-xl p-6 relative overflow-y-auto max-h-[90vh]">
            <button
              onClick={() => setShowTerms(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-primary text-2xl"
            >
              ✕
            </button>
            <h2 className="text-2xl font-bold mb-4 text-primary text-center">
              Terms & Conditions
            </h2>

            <div className="space-y-4 text-gray-700 text-sm leading-relaxed">
              <p>
                Welcome to <strong>Veg Thali Club</strong> (“we,” “our,” or
                “us”). By using our website and services, you agree to comply
                with and be bound by the following Terms and Conditions. Please
                read them carefully before placing any order.
              </p>

              <h3 className="font-semibold text-lg mt-4">1. Service Nature</h3>
              <p>
                Veg Thali Club is a vegetarian food delivery and catering
                facilitator powered by a network of trusted cloud kitchens and
                local catering partners. We ensure every meal follows our
                proprietary recipes and quality standards, coordinating closely
                with our partner kitchens to deliver fresh, authentic, and
                timely vegetarian dishes for every occasion.
              </p>

              <h3 className="font-semibold text-lg mt-4">
                2. Food Responsibility
              </h3>
              <p>
                As we rely on third-party kitchens, we cannot guarantee or take
                responsibility for the quality, taste, freshness, or preparation
                process of food. Any issues regarding food quality should be
                reported to us promptly, and we will work with our partner
                vendors to resolve the matter.
              </p>

              <h3 className="font-semibold text-lg mt-4">
                3. Allergies & Dietary Restrictions
              </h3>
              <p>
                Customers are required to{" "}
                <strong>
                  inform us of any allergies, dietary restrictions, or food
                  sensitivities
                </strong>{" "}
                before placing an order. Veg Thali Club and its partners are not
                liable for allergic reactions or health issues arising from
                failure to disclose such information.
              </p>

              <h3 className="font-semibold text-lg mt-4">
                4. Orders & Payments
              </h3>
              <p>
                Orders once confirmed cannot be canceled or modified later than
                a 24-hour window. Payments must be completed in full before
                delivery. In case of payment failure or disputes, Veg Thali Club
                reserves the right to withhold delivery until the issue is
                resolved.
              </p>

              <h3 className="font-semibold text-lg mt-4">5. Delivery Policy</h3>
              <p>
                We strive to deliver all orders within the estimated time.
                However, delays may occur due to traffic, weather, or vendor
                constraints. Veg Thali Club shall not be liable for delays
                beyond our reasonable control.
              </p>

              <h3 className="font-semibold text-lg mt-4">
                6. Refunds & Cancellations
              </h3>
              <p>
                Refunds will only be issued in cases of incorrect or undelivered
                orders verified by our support team. Taste, portion size, or
                subjective dissatisfaction will not qualify for a refund.
              </p>

              <h3 className="font-semibold text-lg mt-4">
                7. Limitation of Liability
              </h3>
              <p>
                Veg Thali Club, its affiliates, employees, or partners shall not
                be held liable for any direct or indirect damages, including but
                not limited to illness, injury, or losses arising from food
                consumption or delayed delivery.
              </p>

              <h3 className="font-semibold text-lg mt-4">
                8. Third-Party Vendors
              </h3>
              <p>
                Food preparation and handling are done by third-party vendors.
                By placing an order, you acknowledge that Veg Thali Club is not
                responsible for vendor actions, negligence, or hygiene
                practices.
              </p>

              <h3 className="font-semibold text-lg mt-4">9. Governing Law</h3>
              <p>
                These Terms shall be governed by and construed in accordance
                with the laws of the Province of Ontario, Canada. Any disputes
                shall be subject to the exclusive jurisdiction of the courts in
                Toronto, Ontario.
              </p>

              <h3 className="font-semibold text-lg mt-4">10. Contact Us</h3>
              <p>
                For questions, concerns, or complaints, please contact us at{" "}
                <Link
                  href="mailto:info@vegthaliclub.com"
                  className="text-primary underline"
                >
                  info@vegthaliclub.com
                </Link>
                .
              </p>

              <p className="mt-4 text-xs text-gray-500 text-center">
                Last updated: November 2025
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Footer;
