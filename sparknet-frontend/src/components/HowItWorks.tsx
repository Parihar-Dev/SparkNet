import { Upload, Settings, DollarSign, TrendingUp } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Upload,
    title: "Connect Your Resources",
    description: "Link your computing hardware or green energy storage to the platform securely."
  },
  {
    number: "02",
    icon: Settings,
    title: "Configure Sharing",
    description: "Set your pricing, availability, and resource limits according to your preferences."
  },
  {
    number: "03",
    icon: DollarSign,
    title: "Start Earning",
    description: "Resources are automatically matched with buyers. Smart contracts handle all transactions."
  },
  {
    number: "04",
    icon: TrendingUp,
    title: "Track & Optimize",
    description: "Monitor your earnings in real-time and optimize your strategy for maximum returns."
  }
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 relative">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black mb-4">
            How <span className="text-gradient-primary">It Works</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Get started in minutes and begin earning from your idle resources
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {/* Connection Line */}
          <div className="hidden lg:block absolute top-24 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-secondary to-primary opacity-30"></div>

          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="relative">
                <div className="glass-effect rounded-2xl p-8 hover:shadow-glow-primary transition-all group relative z-10">
                  {/* Step Number */}
                  <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full gradient-primary flex items-center justify-center font-bold text-background shadow-glow-primary">
                    {step.number}
                  </div>

                  {/* Icon */}
                  <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Icon className="h-8 w-8 text-primary" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
