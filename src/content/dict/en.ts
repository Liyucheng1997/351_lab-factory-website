import type { Dict } from "./it";

export const en: Dict = {
  meta: {
    title: "LGF · Garment manufacturing in Reggio Emilia, Italy",
    description:
      "Garment manufacturer for women's ready-to-wear in Reggio Emilia, Italy. Cutting, sewing and pressing in one 2,000 m² facility, with every garment tracked.",
  },
  skip: "Skip to content",
  nav: { about: "The workshop", contact: "Contact", cta: "Get a quote" },
  hero: {
    eyebrow: "Garment manufacturing · Reggio Emilia",
    title: "Cutting, sewing and pressing.\nUnder one roof.",
    lead: "We manufacture women's ready-to-wear for Italian brands, from prototype to production.",
    cta: "Request a quote",
    more: "Discover the workshop",
    caption: "3D representation of our workshop",
    drag: "Drag to rotate",
    zones: { cutting: "Cutting", sewing: "Sewing", pressing: "Pressing", quality: "Inspection" },
    tabs: ["Overview", "Cutting", "Sewing", "Pressing", "Inspection"],
    notes: [
      "2,000 m² laid out as one flow: fabric comes in on one side, finished garments leave from the other.",
      "10 m cutting table with spreader and automatic cutter. Every bundle gets a QR-coded ticket.",
      "Industrial lockstitch and overlock machines. Each garment is sewn by a single seamstress.",
      "Vacuum pressing tables, steam generators and a form finisher.",
      "Piece-by-piece inspection on light tables, packing and direct delivery.",
    ],
  },
  about: {
    title: "Why brands work with us.",
    stats: [
      { value: "2,000", unit: "m²", label: "production floor" },
      { value: "15", unit: "", label: "specialists" },
      { value: "3", unit: "", label: "in-house departments" },
      { value: "100%", unit: "", label: "garments tracked" },
    ],
    points: [
      { title: "Everything in-house", text: "Cutting, sewing, pressing and inspection in one facility. We answer directly for every garment." },
      { title: "Every garment tracked", text: "A QR ticket on every bundle and every stage scanned: we always know where your order stands." },
      { title: "Transparent supply chain", text: "Staff on regular contracts, NDAs on request, a workshop open to audits and visits." },
    ],
    clients: "We work for",
    note: "Trademarks belong to their respective owners.",
  },
  contact: {
    title: "Let's talk about your next order.",
    lead: "Send us a short description: garment type, quantity and timing. We reply personally.",
    form: {
      name: "Full name",
      company: "Company / brand",
      email: "Email",
      message: "What would you like to produce?",
      messagePlaceholder: "e.g. 300 wool coats, delivery in March",
      privacy: "I consent to the processing of my data in order to receive a reply.",
      privacyLink: "Privacy notice",
      submit: "Send request",
      sending: "Sending…",
      success: "Thank you, we have received your request. We will get back to you shortly.",
      mailOpened: "We've prepared the email in your mail app — just send it to complete your request.",
      error: "Your message could not be sent.",
      errorMail: "Please write to",
      errorCall: "Please try again later or call us.",
    },
    info: { address: "Address", email: "Email", phone: "Phone", whatsapp: "WhatsApp", hours: "Hours", maps: "Open in Maps", visit: "Workshop visits by appointment." },
  },
  footer: { rights: "All rights reserved.", privacy: "Privacy", vat: "VAT" },
  privacy: {
    title: "Privacy notice",
    updated: "Last updated: October 2026",
    back: "Back to the website",
    sections: [
      { h: "Data controller", p: "The data controller is {company}, based in {city}. For any request about your data, write to the address shown in the Contact section." },
      { h: "Data we collect", p: "Through the contact form we collect your name, company, email and the message you choose to send. The website uses no profiling cookies or third-party trackers." },
      { h: "Purpose and legal basis", p: "We use the data solely to answer your request and for any pre-contractual discussions (Art. 6(1)(b) GDPR). We do not share it with third parties or use it for marketing." },
      { h: "Retention", p: "We keep requests for as long as needed to manage the relationship and in any case no longer than 24 months after the last contact, unless required by law." },
      { h: "Your rights", p: "You may at any time request access to, rectification, erasure or restriction of your data, and lodge a complaint with the Italian Data Protection Authority (Garante)." },
    ],
  },
};
