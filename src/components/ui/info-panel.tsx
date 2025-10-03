import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface InfoPanelProps {
  title: string;
  description: string;
  stats?: Array<{
    label: string;
    value: string;
    unit?: string;
  }>;
  className?: string;
}

export function InfoPanel({ title, description, stats, className }: InfoPanelProps) {
  return (
    <Card className={cn(
      "bg-card/80 backdrop-blur-sm border-border/50 p-6 space-y-4 animate-float",
      className
    )}>
      <div className="space-y-3">
        <h2 className="text-2xl font-bold bg-gradient-stellar bg-clip-text text-transparent">
          {title}
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>
      
      {stats && stats.length > 0 && (
        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-border/30">
          {stats.map((stat, index) => (
            <div key={index} className="text-center p-3 rounded-lg bg-secondary/30">
              <div className="text-lg font-semibold text-primary">
                {stat.value}
                {stat.unit && <span className="text-sm text-muted-foreground ml-1">{stat.unit}</span>}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}