
import Logo from "./Logo.png"
import Logo2 from './Logo2.png'
import search_icon from "./search_icon.svg";
import remove_icon from "./remove_icon.svg";
import arrow_right_icon_colored from "./arrow_right_icon_colored.svg";
import star_icon from "./star_icon.svg";
import star_dull_icon from "./star_dull_icon.svg";
import cart_icon from "./cart_icon.svg";
import nav_cart_icon from "./nav_cart_icon.svg";
import add_icon from "./add_icon.svg";
import refresh_icon from "./refresh_icon.svg";
import product_list_icon from "./product_list_icon.svg";
import order_icon from "./order_icon.svg";
import upload_area from "./upload_area.png";
import profile_icon from "./profile_icon.png";
import menu_icon from "./menu_icon.svg";
import delivery_truck_icon from "./delivery_truck_icon.svg";
import leaf_icon from "./leaf_icon.svg";
import coin_icon from "./coin_icon.svg";
import box_icon from "./box_icon.svg";
import trust_icon from "./trust_icon.svg";
import black_arrow_icon from "./black_arrow_icon.svg";
import white_arrow_icon from "./white_arrow_icon.svg";
import main_banner_bg from "./main_banner_bg.png";
import main_banner_bg_sm from "./main_banner_bg_sm.png";
import bottom_banner_image from "./bottom_banner_image.png";
import bottom_banner_image_sm from "./bottom_banner_image_sm.png";
import add_address_iamge from "./add_address_image.svg";
import bell_icon from './bell_icon.png';
import chat_icon from './chat_icon.png';
import chart_icon from './chart_icon.png';
import main_banner_bg2 from './main_banner_bg2.png'
import main_banner_bg3 from './main_banner_bg3.png'
// ── AutoDex category images (same filenames, new automotive content) ──────────
import organic_vegitable_image from "./organic_vegitable_image.png"; // Primer
import fresh_fruits_image from "./fresh_fruits_image.png";           // Clearcoat
import bottles_image from "./bottles_image.png";                     // Thinners
import maggi_image from "./maggi_image.png";                         // Putty/Filler
import dairy_product_image from "./dairy_product_image.png";         // Basecoat Paint
import bakery_image from "./bakery_image.png";                       // Sanding
import grain_image from "./grain_image.png";                         // Masking Tape
import Meat from './Meat.png';                                       // Body Sealant
import Snacks from './Snacks.png';                                   // Gloves
import HouseHold from './HouseHold.jpg';                             // Ceramic Shield
import Spices from './Spices.jpg';                                   // Acrylic Spray
import PersonalCare from './PersonalCare.png';                       // Workwear

export const assets = {
  Logo,
  search_icon,
  remove_icon,
  arrow_right_icon_colored,
  star_icon,
  star_dull_icon,
  cart_icon,
  nav_cart_icon,
  add_icon,
  refresh_icon,
  product_list_icon,
  order_icon,
  upload_area,
  profile_icon,
  menu_icon,
  delivery_truck_icon,
  leaf_icon,
  coin_icon,
  trust_icon,
  black_arrow_icon,
  white_arrow_icon,
  main_banner_bg,
  main_banner_bg_sm,
  bottom_banner_image,
  bottom_banner_image_sm,
  main_banner_bg2,
  main_banner_bg3,
  add_address_iamge,
  box_icon,
  bell_icon,
  chat_icon,
  chart_icon,
  Logo2,
};

export const categories = [
  {
    text: "Primer & Grundfärg",
    path: "Primer",
    image: organic_vegitable_image,
    bgColor: "#1E2A3A",
  },
  {
    text: "Clearcoat",
    path: "Clearcoat",
    image: fresh_fruits_image,
    bgColor: "#1A1A2E",
  },
  {
    text: "Thinners & Degreaser",
    path: "Thinners",
    image: bottles_image,
    bgColor: "#2A1A1A",
  },
  {
    text: "Putty & Filler",
    path: "Putty",
    image: maggi_image,
    bgColor: "#1A2A1A",
  },
  {
    text: "Paint & Basecoat",
    path: "Paint",
    image: dairy_product_image,
    bgColor: "#2A2A1A",
  },
  {
    text: "Sanding & Abrasives",
    path: "Sanding",
    image: bakery_image,
    bgColor: "#1A1A1A",
  },
  {
    text: "Masking & Tape",
    path: "Masking",
    image: grain_image,
    bgColor: "#1E1E2E",
  },
  {
    text: "Body Sealant",
    path: "Sealant",
    image: Meat,
    bgColor: "#2A1A2A",
  },
  {
    text: "Gloves & Safety",
    path: "Safety",
    image: Snacks,
    bgColor: "#1A2A2A",
  },
  {
    text: "Ceramic & Car Care",
    path: "CarCare",
    image: HouseHold,
    bgColor: "#2A1E1A",
  },
  {
    text: "Aerosol Spray",
    path: "Aerosol",
    image: Spices,
    bgColor: "#1E2A1E",
  },
  {
    text: "Workwear",
    path: "Workwear",
    image: PersonalCare,
    bgColor: "#2A2A2A",
  },
];

export const footerLinks = [
  {
    title: "Quick Links",
    links: [
      { text: "Home", url: "#" },
      { text: "Best Sellers", url: "#" },
      { text: "Offers & Deals", url: "#" },
      { text: "Contact Us", url: "#" },
      { text: "FAQs", url: "#" },
    ],
  },
  {
    title: "Need help?",
    links: [
      { text: "Delivery Information", url: "#" },
      { text: "Return & Refund Policy", url: "#" },
      { text: "Payment Methods", url: "#" },
      { text: "Track your Order", url: "#" },
      { text: "Contact Us", url: "#" },
    ],
  },
  {
    title: "Follow Us",
    links: [
      { text: "Instagram", url: "#" },
      { text: "Twitter", url: "#" },
      { text: "Facebook", url: "#" },
      { text: "YouTube", url: "#" },
    ],
  },
];

export const features = [
  {
    icon: delivery_truck_icon,
    title: "Fast Delivery",
    description: "Professional auto products delivered fast.",
  },
  {
    icon: leaf_icon,
    title: "Pro Quality",
    description: "Chamäleon GmbH certified products.",
  },
  {
    icon: coin_icon,
    title: "Best Prices",
    description: "Trade & retail pricing for everyone.",
  },
  {
    icon: trust_icon,
    title: "Trusted by Pros",
    description: "Used by 10,000+ workshops across Sweden.",
  },
];
