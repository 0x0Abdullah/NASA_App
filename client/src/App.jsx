import { Suspense, lazy } from "react";
import { MotionConfig } from "framer-motion";
import Navbar from "./components/Navbar.jsx";
import ScrollProgress from "./components/ScrollProgress.jsx";
import Hero from "./components/Hero.jsx";
import Stats from "./components/Stats.jsx";
import Timeline from "./components/Timeline.jsx";
import Stories from "./components/Stories.jsx";
import QuoteSection from "./components/QuoteSection.jsx";
import LazyMount from "./components/LazyMount.jsx";
import Gallery from "./components/Gallery.jsx";
import ArchiveSection from "./components/ArchiveSection.jsx";
import Footer from "./components/Footer.jsx";

const ModelHangar = lazy(() => import("./components/ModelHangar.jsx"));

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <div className="relative min-h-screen">
        <div className="space-bg" aria-hidden="true" />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-signal focus:px-5 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-void"
        >
          Skip to main content
        </a>
        <ScrollProgress />
        <Navbar />
        <main id="main-content" tabIndex={-1}>
          <Hero />
          <Stats />
          <Timeline />
          <Stories />
          <QuoteSection />
          <LazyMount fallback={<div className="min-h-[760px]" aria-hidden="true" />}>
            <Suspense fallback={<div className="min-h-[760px]" aria-hidden="true" />}>
              <ModelHangar />
            </Suspense>
          </LazyMount>
          <Gallery />
          <ArchiveSection />
        </main>
        <Footer />
      </div>
    </MotionConfig>
  );
}
