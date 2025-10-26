import { Button } from "@/components/ui/button";
import { ArrowRight, Cpu, Battery } from "lucide-react";
import { useNavigate } from "react-router-dom";

import Hyperspeed from './Hyperspeed';

// the component will fill the height/width of its parent container, edit the CSS to change this
// the options below are the default values



const Hero = () => {

  const navigate = useNavigate();
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background */}
      <Hyperspeed
        effectOptions={{
          onSpeedUp: () => { },
          onSlowDown: () => { },
          distortion: 'turbulentDistortion',
          length: 400,
          roadWidth: 10,
          islandWidth: 2,
          lanesPerRoad: 4,
          fov: 90,
          fovSpeedUp: 150,
          speedUp: 2,
          carLightsFade: 0.4,
          totalSideLightSticks: 20,
          lightPairsPerRoadWay: 40,
          shoulderLinesWidthPercentage: 0.05,
          brokenLinesWidthPercentage: 0.1,
          brokenLinesLengthPercentage: 0.5,
          lightStickWidth: [0.12, 0.5],
          lightStickHeight: [1.3, 1.7],
          movingAwaySpeed: [60, 80],
          movingCloserSpeed: [-120, -160],
          carLightsLength: [400 * 0.03, 400 * 0.2],
          carLightsRadius: [0.05, 0.14],
          carWidthPercentage: [0.3, 0.5],
          carShiftX: [-0.8, 0.8],
          carFloorSeparation: [0, 5],
          colors: {
            roadColor: 0x080808,
            islandColor: 0x0a0a0a,
            background: 0x000000,
            shoulderLines: 0xFFFFFF,
            brokenLines: 0xFFFFFF,
            leftCars: [0xD856BF, 0x6750A2, 0xC247AC],
            rightCars: [0x03B3C3, 0x0E5EA5, 0x324555],
            sticks: 0x03B3C3,
          }
        }}
      />

      {/* Animated Background Elements */}
      {/* <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div> */}

      {/* Content */}
      <div className="container mx-auto px-6 z-10 ">
        <div className="text-center max-w-5xl mx-auto ">

          <h1 className="text-5xl md:text-7xl font-semibold mb-6 leading-tight animate-fade-in delay-100">
            Decentralized Compute {" "}
            <span>Marketplace</span>
            <div>Built on Stellar</div>
          </h1>

          <p className="text-base md:text-lg text-muted-foreground mb-12 max-w-3xl mx-auto animate-fade-in delay-200">
            Rent out your idle GPU/CPU power and stored green energy.
            Earn crypto rewards while contributing to a sustainable, decentralized future.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16 animate-fade-in delay-300">
            <Button 
              className="gradient-primary text-background font-semibold px-8 py-6 text-lg shadow-glow-primary hover:scale-105 transition-transform"
            >
              Start Renting Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              variant="outline" 
              className="border-primary/50 text-foreground hover:bg-primary/10 px-8 py-6 text-lg"
              onClick={() => navigate("/marketplace")}
            >
              Explore Marketplace
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto animate-fade-in delay-500">
            <div className="glass-effect rounded-2xl p-6 hover:shadow-glow-primary transition-all">
              <div className="text-4xl md:text-5xl font-bold text-gradient-primary mb-2">100%</div>
              <div className="text-muted-foreground">Decentralized</div>
            </div>
            <div className="glass-effect rounded-2xl p-6 hover:shadow-glow-secondary transition-all">
              <div className="text-4xl md:text-5xl font-bold text-gradient-secondary mb-2">0</div>
              <div className="text-muted-foreground">Middlemen</div>
            </div>
            <div className="glass-effect rounded-2xl p-6 hover:shadow-glow-primary transition-all">
              <div className="text-4xl md:text-5xl font-bold text-gradient-primary mb-2">∞</div>
              <div className="text-muted-foreground">Scalability</div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-primary/50 rounded-full flex justify-center">
          <div className="w-1.5 h-3 bg-primary rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
