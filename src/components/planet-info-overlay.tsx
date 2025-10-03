import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, Maximize2 } from "lucide-react";
import { PlanetViewer } from "@/components/ui/planet-viewer";

interface PlanetData {
  id: string;
  name: string;
  position: [number, number, number];
  radius: number;
  color: string;
  temperature: number;
  period: number;
  stats: Array<{
    label: string;
    value: string;
    unit?: string;
  }>;
}

interface PlanetInfoOverlayProps {
  planet: PlanetData;
  onClose: () => void;
  onExpand?: () => void;
}

export function PlanetInfoOverlay({ planet, onClose, onExpand }: PlanetInfoOverlayProps) {
  // Generate key points based on planet data
  const keyPoints = [
    `Located at coordinates [${planet.position[0].toFixed(1)}, ${planet.position[1].toFixed(1)}, ${planet.position[2].toFixed(1)}]`,
    `Surface temperature: ${planet.temperature}K`,
    `Orbital period: ${planet.period} days`,
    `Radius: ${planet.radius} Earth radii`,
    `Color classification: ${planet.color}`
  ];

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm pointer-events-auto" onClick={onClose} />
      
      {/* Info Panel */}
      <div className="absolute bottom-6 left-6 right-6 lg:left-auto lg:w-96 pointer-events-auto">
        <Card className="bg-card/95 backdrop-blur-md border-border/50 p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <Badge className="bg-accent text-accent-foreground mb-2">
                Moon Theif
              </Badge>
              <h2 className="text-2xl font-bold bg-gradient-stellar bg-clip-text text-transparent">
                {planet.name}
              </h2>
            </div>
            <div className="flex gap-2">
              {onExpand && (
                <Button variant="ghost" size="sm" onClick={onExpand}>
                  <Maximize2 className="w-4 h-4" />
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Planet Preview */}
          <div className="h-32 mb-4 relative">
            <PlanetViewer 
              className="w-full h-full" 
              planetColor={planet.color}
              planetTemperature={planet.temperature}
            />
          </div>

          {/* Key Points */}
          <div className="space-y-3 mb-4">
            <h3 className="text-sm font-semibold text-primary">Characteristics</h3>
            <ul className="space-y-1">
              {keyPoints.slice(0, 3).map((point, index) => (
                <li key={index} className="text-xs text-muted-foreground flex items-start">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mr-2 mt-1.5 flex-shrink-0"></span>
                  {point}
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-2">
            {planet.stats.slice(0, 4).map((stat, index) => (
              <div key={index} className="text-center p-2 rounded bg-secondary/30">
                <div className="text-sm font-semibold text-primary">
                  {stat.value}
                  {stat.unit && <span className="text-xs text-muted-foreground ml-1">{stat.unit}</span>}
                </div>
                <div className="text-xs text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* Expand button */}
          <Button 
            variant="outline" 
            className="w-full mt-4" 
            onClick={() => onExpand?.()}
          >
            View detailed analysis
          </Button>
        </Card>
      </div>
    </div>
  );
}