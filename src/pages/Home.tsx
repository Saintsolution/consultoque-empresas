import Hero from '@/components/home/Hero';
import Benefits from '@/components/home/Benefits';
import Pricing from '@/components/home/Pricing';
import VideoSection from '@/components/home/VideoSection';
import { LegalCompliance } from '@/components/home/LegalCompliance';

export default function Home() {
  return (
    <>
      <Hero />
      <Benefits />
      <Pricing />
      <VideoSection />
      <LegalCompliance />
    </>
  );
}