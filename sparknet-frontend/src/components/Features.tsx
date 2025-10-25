import { Cpu, Battery, Coins, Shield, Zap, Globe } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    icon: Cpu,
    title: "GPU/CPU Sharing",
    description: "Monetize your idle computing power. Rent out GPU/CPU resources to those who need them.",
    gradient: "gradient-primary"
  },
  {
    icon: Battery,
    title: "Green Energy Trading",
    description: "Share your solar battery storage and earn from excess renewable energy capacity.",
    gradient: "gradient-energy"
  },
  {
    icon: Coins,
    title: "Crypto Rewards",
    description: "Get paid instantly in cryptocurrency for every resource you share on the network.",
    gradient: "gradient-secondary"
  },
  {
    icon: Shield,
    title: "Secure & Trustless",
    description: "Smart contracts ensure automatic, secure transactions without intermediaries.",
    gradient: "gradient-primary"
  },
  {
    icon: Zap,
    title: "Real-time Monitoring",
    description: "Track your earnings, resource utilization, and network status in real-time.",
    gradient: "gradient-energy"
  },
  {
    icon: Globe,
    title: "Global Network",
    description: "Connect with users worldwide in a truly decentralized peer-to-peer marketplace.",
    gradient: "gradient-secondary"
  }
];

const Features = () => {
  return (
    <section id="features" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background"></div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black mb-4">
            Why Choose <span className="text-gradient-primary">EnergyShare</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A revolutionary platform combining compute power and renewable energy in one decentralized marketplace
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={index} 
                className="glass-effect border-border/50 hover:border-primary/50 transition-all hover:shadow-glow-primary group"
              >
                <CardHeader>
                  <div className={`w-14 h-14 rounded-xl ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="h-7 w-7 text-background" />
                  </div>
                  <CardTitle className="text-2xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base text-muted-foreground">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
