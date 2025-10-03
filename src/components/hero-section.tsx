import { PlanetViewer } from "@/components/ui/planet-viewer";
import { InfoPanel } from "@/components/ui/info-panel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import logoImage from "@/assets/moon-thief-logo.png";
import starfieldImage from "@/assets/starfield-bg.jpg";

export function HeroSection() {
  const exoplanetData = {
    name: "Kepler-442b",
    description: "A fascinating super-Earth exoplanet located in the habitable zone of its host star Kepler-442. This remarkable world orbits within the perfect distance range where liquid water could potentially exist on its surface. With a radius approximately 1.34 times that of Earth and an orbital period of 112.3 days, Kepler-442b represents one of the most promising candidates for potentially habitable worlds beyond our solar system. Its host star, a K-type main-sequence star, provides stable energy output that could support complex atmospheric dynamics and potentially even life as we know it.",
    stats: [
      { label: "Mass", value: "2.3", unit: "M⊕" },
      { label: "Radius", value: "1.34", unit: "R⊕" },
      { label: "Period", value: "112.3", unit: "days" },
      { label: "Distance", value: "1,206", unit: "ly" },
      { label: "Temp", value: "233", unit: "K" },
      { label: "ESI", value: "0.84", unit: "" }
    ]
  };

  return (
    <div 
      className="min-h-screen relative flex items-center justify-center overflow-hidden"
      style={{
        backgroundImage: `url(${starfieldImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Cosmic Overlay */}
      <div className="absolute inset-0 bg-gradient-cosmic/80" />
      
      {/* Content Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
        
        {/* Left Side - Branding & Planet */}
        <div className="space-y-8 text-center lg:text-left">
          {/* Logo */}
          <div className="flex justify-center lg:justify-start">
            <img 
              src={logoImage} 
              alt="Moon Thief" 
              className="h-16 animate-pulse-glow"
            />
          </div>
          
          {/* Tagline */}
          <div className="space-y-4">
            <Badge variant="secondary" className="px-4 py-2 text-sm animate-shimmer">
              Interactive 3D Exoplanet Discovery Platform
            </Badge>
            <h1 className="text-4xl lg:text-6xl font-bold">
              <span className="text-foreground">Discover </span>
              <span className="bg-gradient-stellar bg-clip-text text-transparent">
                Worlds
              </span>
              <br />
              <span className="text-foreground">Beyond </span>
              <span className="bg-gradient-stellar bg-clip-text text-transparent">
                Imagination
              </span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-lg">
              Explore NASA's exoplanet discoveries through AI-powered 3D visualization. 
              Every world tells a story waiting to be unveiled.
            </p>
          </div>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <Link to="/explorer">
              <Button variant="hero" size="lg">
                Start Exploring
              </Button>
            </Link>
            <Button variant="outline" size="lg">
              Learn More
            </Button>
          </div>
        </div>
        
        {/* Right Side - 3D Planet & Info */}
        <div className="space-y-6">
          {/* 3D Planet Viewer */}
          <div className="relative">
            <div className="aspect-square max-w-md mx-auto">
              <PlanetViewer className="w-full h-full" />
            </div>
            <div className="absolute -top-4 -right-4 z-20">
              <Badge className="bg-accent text-accent-foreground shadow-glow-accent animate-pulse">
                AI Generated
              </Badge>
            </div>
          </div>
          
          {/* Planet Info Panel */}
          <InfoPanel
            title={exoplanetData.name}
            description={exoplanetData.description}
            stats={exoplanetData.stats}
            className="max-w-md mx-auto lg:max-w-none"
          />
        </div>
      </div>
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-10 animate-float">
        <div className="w-2 h-2 bg-primary rounded-full shadow-glow-primary" />
      </div>
      <div className="absolute bottom-32 right-16 animate-float" style={{ animationDelay: '2s' }}>
        <div className="w-3 h-3 bg-accent rounded-full shadow-glow-accent" />
      </div>
      <div className="absolute top-1/2 left-4 animate-float" style={{ animationDelay: '4s' }}>
        <div className="w-1 h-1 bg-primary rounded-full" />
      </div>
    </div>
  );
}