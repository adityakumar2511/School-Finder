import type { Metadata } from "next";
import ContactForm from "./ContactForm";
import { Mail, Phone, MapPin, Facebook, Instagram } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact Us | SchoolFinder",
  description: "Get in touch with the SchoolFinder team. We'd love to hear from you.",
};

const SOCIAL_LINKS = [
  {
    icon: Facebook,
    label: "Facebook",
    href: "https://facebook.com/lakshyaone", 
  },
  {
    icon: Instagram,
    label: "Instagram",
    href: "https://instagram.com/lakshyaone_"
  },
];

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-blue-800 py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-white mb-3">Get in Touch</h1>
          <p className="text-blue-200 text-lg">
            Have a question or feedback? We read every message.
          </p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 py-16 grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* Contact info */}
        <div className="space-y-6">
          <h2 className="font-semibold text-gray-900 text-lg">Contact Info</h2>
          <div className="flex items-start gap-3 text-sm text-gray-600">
            <Mail className="w-4 h-4 mt-0.5 text-blue-600 shrink-0" />
            <div>
              <p className="font-medium text-gray-800">Email</p>
              <p>info.lakshyaone@gmail.com</p>
            </div>
          </div>
          {/* <div className="flex items-start gap-3 text-sm text-gray-600">
            <Phone className="w-4 h-4 mt-0.5 text-blue-600 shrink-0" />
            <div>
              <p className="font-medium text-gray-800">Phone</p>
              <p>+91 00000 00000</p>
            </div>
          </div> */}
          <div className="flex items-start gap-3 text-sm text-gray-600">
            <MapPin className="w-4 h-4 mt-0.5 text-blue-600 shrink-0" />
            <div>
              <p className="font-medium text-gray-800">Based in</p>
              <p>Prayagraj, Uttar Pradesh</p>
            </div>  
          </div>

          {/* Social links */}
          <div className="pt-2">
            <p className="font-medium text-gray-800 text-sm mb-3">Follow Us</p>
            <div className="flex items-center gap-3">
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-200 text-black text-blue-600 transition-colors hover:bg-blue-600 hover:text-white"
                >
                  <social.icon className="w-6 h-6" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="md:col-span-2">
          <ContactForm />
        </div>
      </section>
    </div>
  );
}