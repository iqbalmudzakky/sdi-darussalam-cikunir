import About from "@/components/About";
import Activity from "@/components/Activity";
import Contact from "@/components/Contact";
import Facility from "@/components/Facility";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import Navbar from "@/components/Navbar";
import Program from "@/components/Program";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <Navbar />

      {/* Hero Section */}
      <Hero />

      {/* About Section */}
      <About />

      {/* Program Section */}
      <Program />

      {/* Facility Section */}
      <Facility />

      {/* Activity Section */}
      <Activity />

      {/* Contact Section */}
      <Contact />

      {/* Footer */}
      <Footer />
    </div>
  );
}
