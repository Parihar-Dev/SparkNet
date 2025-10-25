import { Button } from "@/components/ui/button";
import { ArrowRight, Cpu, Battery } from "lucide-react";
import heroBackground from "@/assets/hero-bg.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroBackground} 
          alt="Decentralized Network" 
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background"></div>
      </div>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

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
            <Button className="gradient-primary text-background font-semibold px-8 py-6 text-lg shadow-glow-primary hover:scale-105 transition-transform">
              Start Earning Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button variant="outline" className="border-primary/50 text-foreground hover:bg-primary/10 px-8 py-6 text-lg">
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
