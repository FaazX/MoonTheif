import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const features = [
  {
    title: "AI-Powered Detection",
    description: "Advanced machine learning algorithms analyze NASA's telescope data to identify potential exoplanets with unprecedented accuracy.",
    icon: "🤖",
    badge: "Machine Learning"
  },
  {
    title: "3D Visualization",
    description: "Immersive WebGL rendering brings distant worlds to life with realistic textures and atmospheric effects.",
    icon: "🌍",
    badge: "Interactive 3D"
  },
  {
    title: "NASA Integration",
    description: "Direct access to Kepler, TESS, and K2 mission data ensures scientific accuracy and real-time discoveries.",
    icon: "🚀",
    badge: "NASA Data"
  },
  {
    title: "Intelligent Descriptions",
    description: "Google Gemini AI generates detailed, scientifically accurate descriptions of each discovered exoplanet.",
    icon: "📝",
    badge: "AI Generated"
  }
];

export function FeaturesSection() {
  return (
    <section className="py-24 px-6 relative">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-nebula opacity-30" />
      <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16 space-y-4">
          <Badge className="mb-4 bg-secondary/80 text-secondary-foreground border border-border/30">
            Platform Features
          </Badge>
          <h2 className="text-4xl lg:text-5xl font-bold">
            <span className="text-foreground">Revolutionizing </span>
            <span className="bg-gradient-stellar bg-clip-text text-transparent">
              Space Discovery
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Combining cutting-edge AI with NASA's astronomical data to create 
            the most advanced exoplanet discovery platform ever built.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {features.map((feature, index) => (
            <Card 
              key={index}
              className="p-6 bg-card/80 backdrop-blur-sm border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-glow-primary/20 animate-float group"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="text-3xl group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <Badge variant="secondary" className="text-xs opacity-80">
                    {feature.badge}
                  </Badge>
                </div>
                <h3 className="text-lg font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center space-y-6">
          <h3 className="text-2xl font-bold text-foreground">
            Ready to explore the cosmos?
          </h3>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="hero" size="lg">
              Launch Discovery
            </Button>
            <Button variant="outline" size="lg">
              View Documentation
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}