import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Cpu, Battery, ArrowRight, Gauge, Clock } from "lucide-react";

const offerings = [
  {
    type: "Compute Power",
    icon: Cpu,
    gradient: "gradient-secondary",
    items: [
      { name: "GPU RTX 4090", rate: "0.05 ETH/hour", available: "85%" },
      { name: "CPU AMD Ryzen 9", rate: "0.02 ETH/hour", available: "92%" },
      { name: "GPU RTX 3080", rate: "0.03 ETH/hour", available: "78%" }
    ]
  },
  {
    type: "Green Energy",
    icon: Battery,
    gradient: "gradient-energy",
    items: [
      { name: "Solar Storage 10kWh", rate: "0.01 ETH/kWh", available: "95%" },
      { name: "Home Battery 5kWh", rate: "0.008 ETH/kWh", available: "88%" },
      { name: "Solar Storage 20kWh", rate: "0.012 ETH/kWh", available: "72%" }
    ]
  }
];

const Marketplace = () => {
  return (
    <section id="marketplace" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/5 to-background"></div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black mb-4">
            Active <span className="text-gradient-primary">Marketplace</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Browse available resources or list your own to start earning
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {offerings.map((offering, idx) => {
            const Icon = offering.icon;
            return (
              <Card key={idx} className="glass-effect border-border/50 hover:border-primary/50 transition-all hover:shadow-glow-primary">
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-14 h-14 rounded-xl ${offering.gradient} flex items-center justify-center`}>
                      <Icon className="h-7 w-7 text-background" />
                    </div>
                    <span className="px-3 py-1 rounded-full glass-effect text-sm text-primary border border-primary/30">
                      Live
                    </span>
                  </div>
                  <CardTitle className="text-2xl">{offering.type}</CardTitle>
                  <CardDescription>Available resources on the network</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {offering.items.map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-background/50 hover:bg-background/80 transition-colors border border-border/50">
                        <div className="flex-1">
                          <div className="font-semibold mb-1">{item.name}</div>
                          <div className="text-sm text-muted-foreground flex items-center space-x-2">
                            <Clock className="h-3 w-3" />
                            <span>{item.rate}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="text-right">
                            <div className="flex items-center space-x-1 text-sm">
                              <Gauge className="h-3 w-3 text-secondary" />
                              <span className="text-secondary font-semibold">{item.available}</span>
                            </div>
                            <div className="text-xs text-muted-foreground">Available</div>
                          </div>
                          <Button size="sm" className="gradient-primary text-background">
                            Rent
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full mt-6 border-primary/50 hover:bg-primary/10">
                    View All {offering.type}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Marketplace;
