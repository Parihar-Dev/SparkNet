import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CTA = () => {

  const navigate = useNavigate();
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 gradient-primary opacity-10"></div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto glass-effect rounded-3xl p-12 md:p-16 border-2 border-primary/20 shadow-glow-primary">
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 mb-6">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-primary">Start Your Journey Today</span>
            </div>

            <h2 className="text-4xl md:text-5xl font-black mb-6">
              Ready to Turn Idle Resources into{" "}
              <span className="text-gradient-primary">Crypto Rewards?</span>
            </h2>

            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Join thousands of providers already earning passive income on the world's first decentralized compute and energy marketplace.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button 
                className="gradient-primary text-background font-semibold px-8 py-6 text-lg shadow-glow-primary hover:scale-105 transition-transform"
                onClick={() => navigate("/register-provider")}
              >
                Become a Provider
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button variant="outline" className="border-primary/50 text-foreground hover:bg-primary/10 px-8 py-6 text-lg">
                Learn More
              </Button>
            </div>

            <div className="mt-10 flex items-center justify-center space-x-8 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>No Signup Fees</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-secondary rounded-full"></div>
                <span>Instant Payouts</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-accent rounded-full"></div>
                <span>24/7 Support</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
