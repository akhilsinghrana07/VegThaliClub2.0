import { NextResponse } from "next/server";

import { HeaderItem } from "@/app/types/menu";
import { FeaturesType } from "@/app/types/features";
import { ExpertChiefType } from "@/app/types/expertchief";
import { GalleryImagesType } from "@/app/types/galleryimage";
import { FooterLinkType } from "@/app/types/footerlink";
import { FullMenuType } from "@/app/types/fullmenu";

const HeaderData: HeaderItem[] = [
  // { label: "About Us", href: "/#aboutus" },
  { label: "Menu", href: "/#menu" },
  { label: "Contact Us", href: "/#reserve" },
  // { label: 'Docs', href: '/documentation' },
];

const FeaturesData: FeaturesType[] = [
  {
    imgSrc: "/images/Features/featureOne.svg",
    heading: "Authentic Indian Flavors",
    subheading:
      "Experience the taste of India with homestyle recipes and aromatic spices made fresh daily.",
  },
  {
    imgSrc: "/images/Features/featureTwo.svg",
    heading: "Freshly Prepared in Our Cloud Kitchen",
    subheading:
      "Every dish is cooked to order in our hygienic cloud kitchen — ensuring quality, freshness, and consistency.",
  },
  {
    imgSrc: "/images/Features/featureThree.svg",
    heading: "Customized Catering Packages",
    subheading:
      "From corporate lunches to festive gatherings, our flexible menus fit every event and budget.",
  },
  {
    imgSrc: "/images/Features/featureFour.svg",
    heading: "Seamless Ordering & Delivery",
    subheading:
      "Order effortlessly through our online platform and enjoy on-time delivery, hot and fresh to your doorstep.",
  },
];

const ExpertChiefData: ExpertChiefType[] = [
  {
    profession: "Senior Chef",
    name: "Marco Benton",
    imgSrc: "/images/Expert/boyone.png",
  },
  {
    profession: "Junior Chef",
    name: "Elena Rivera",
    imgSrc: "/images/Expert/girl.png",
  },
  {
    profession: "Junior Chef",
    name: "John Doe",
    imgSrc: "/images/Expert/boytwo.png",
  },
];

const GalleryImagesData: GalleryImagesType[] = [
  {
    src: "/images/Gallery/foodone.webp",
    name: "Caesar Salad(187 Kcal)",
    price: 35,
  },
  {
    src: "/images/Gallery/foodtwo.webp",
    name: "Christmas salad(118 Kcal)",
    price: 17,
  },
  {
    src: "/images/Gallery/foodthree.webp",
    name: "Sauteed mushrooms with pumpkin bowl(238 kcal)",
    price: 45,
  },
  {
    src: "/images/Gallery/foodfour.webp",
    name: "BBQ Chicken Feast Pizza(272 kcal)",
    price: 27,
  },
];

const FullMenuData: FullMenuType[] = [
  {
    name: "Grilled Salmon",
    price: "$18.99",
    description: "Served with lemon butter sauce and grilled vegetables.",
  },
  {
    name: "Caesar Salad",
    price: "$9.99",
    description: "Crisp romaine with parmesan, croutons, and Caesar dressing.",
  },
  {
    name: "Margherita Pizza",
    price: "$13.49",
    description: "Classic pizza with tomato, mozzarella, and fresh basil.",
  },
  {
    name: "Tomato Basil Soup",
    price: "$6.99",
    description: "Creamy tomato soup with a hint of garlic and fresh basil.",
  },
  {
    name: "Chocolate Lava Cake",
    price: "$7.99",
    description:
      "Warm chocolate cake with a molten center served with vanilla ice cream.",
  },
  {
    name: "Spaghetti Carbonara",
    price: "$15.25",
    description:
      "Spaghetti tossed with eggs, pancetta, parmesan, and black pepper.",
  },
  {
    name: "Tiramisu",
    price: "$8.50",
    description:
      "Layered espresso-soaked ladyfingers with mascarpone and cocoa.",
  },
];

const FooterLinkData: FooterLinkType[] = [
  {
    section: "Company",
    links: [
      { label: "Home", href: "/" },
      { label: "About Us", href: "/#aboutus" },
      { label: "Menu", href: "/#menu" },
      // { label: "Reserve Table", href: "/#reserve" },
    ],
  },
  {
    section: "Support",
    links: [
      { label: "Help/FAQ", href: "/" },
      { label: "Press", href: "/" },
      { label: "Affiliates", href: "/" },
      { label: "Hotel owners", href: "/" },
      { label: "Partners", href: "/" },
    ],
  },
];

export const GET = () => {
  return NextResponse.json({
    HeaderData,
    FeaturesData,
    ExpertChiefData,
    GalleryImagesData,
    FullMenuData,
    FooterLinkData,
  });
};
