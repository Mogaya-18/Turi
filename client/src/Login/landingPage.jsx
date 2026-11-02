import HeroSection from "../Login/heroSection";
import FeatureCards from "../Login/featureCards";
import HowItWorks from "../Login/howItWorks";
import "./landingPage.css";

export default function LandingPage() {
  return (
    <main className="landing-page">
      <HeroSection />
      <FeatureCards />
      <HowItWorks />
    </main>
  );
}
