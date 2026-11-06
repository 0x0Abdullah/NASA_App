import Navbar from "./components/Navbar.jsx";
import ScrollProgress from "./components/ScrollProgress.jsx";
import Hero from "./components/Hero.jsx";
import Stats from "./components/Stats.jsx";
import Timeline from "./components/Timeline.jsx";
import Stories from "./components/Stories.jsx";
import QuoteSection from "./components/QuoteSection.jsx";
import ModelHangar from "./components/ModelHangar.jsx";
import Gallery from "./components/Gallery.jsx";
import ArchiveSection from "./components/ArchiveSection.jsx";
import Footer from "./components/Footer.jsx";

export default function App() {
  return (
    <div className="relative min-h-screen">
      <div className="space-bg" aria-hidden="true" />
      <ScrollProgress />
      <Navbar />
      <main>
        <Hero />
        <Stats />
        <Timeline />
        <Stories />
        <QuoteSection />
        <ModelHangar />
        <Gallery />
      </main>
      <ArchiveSection />
      <Footer />
    </div>
  );
}
