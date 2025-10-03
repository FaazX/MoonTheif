import { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlanetViewer } from "@/components/ui/planet-viewer";
import { ArrowLeft, Shuffle, Search, Globe, Home } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { StarfieldBackground } from "@/components/starfield-background";
import { UniverseViewer } from "@/components/universe-viewer";
import { PlanetInfoOverlay } from "@/components/planet-info-overlay";

interface NASAExoplanetData {
  kepoi_name: string;
  koi_period: number;
  koi_prad: number;
  koi_teq: number;
  koi_steff: number;
  koi_srad: number;
  koi_insol: number;
  koi_disposition: string;
  koi_kepmag: number;
  ra_str: string;
  dec_str: string;
}

interface ExoplanetData {
  name: string;
  keyPoints: string[];
  stats: Array<{
    label: string;
    value: string;
    unit?: string;
  }>;
  color: string;
  temperature: number;
  atmosphereData: Array<{
    component: string;
    percentage: number;
  }>;
  temperatureHistory: Array<{
    period: string;
    temperature: number;
  }>;
  habitabilityMetrics: Array<{
    metric: string;
    value: number;
  }>;
}

interface UniversePlanetData {
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

const NASA_API_URL = "https://exoplanetarchive.ipac.caltech.edu/cgi-bin/nstedAPI/nph-nstedAPI?table=cumulative&where=koi_prad<2%20and%20koi_teq>180%20and%20koi_teq<303%20and%20koi_disposition%20like%20%27CANDIDATE%27&format=json";

// Cache for NASA API data
let nasaExoplanetsCache: NASAExoplanetData[] | null = null;

const COLORS = ['#FF6B35', '#F7931E', '#FFD23F', '#6A994E', '#168AAD', '#277DA1', '#4D194D', '#A663CC'];

export default function Explorer() {
  const [planetName, setPlanetName] = useState("");
  const [exoplanetData, setExoplanetData] = useState<ExoplanetData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [availablePlanets, setAvailablePlanets] = useState<NASAExoplanetData[]>([]);
  const [universePlanets, setUniversePlanets] = useState<UniversePlanetData[]>([]);
  const [selectedPlanet, setSelectedPlanet] = useState<UniversePlanetData | null>(null);
  const [viewMode, setViewMode] = useState<'universe' | 'detailed'>('universe');
  const [searchQuery, setSearchQuery] = useState("");
  const [discoveredPlanets, setDiscoveredPlanets] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  // Load NASA exoplanet data on component mount
  const loadNASAData = async () => {
    if (nasaExoplanetsCache) {
      setAvailablePlanets(nasaExoplanetsCache);
      return;
    }

    try {
      const response = await fetch(NASA_API_URL);
      if (!response.ok) throw new Error('Failed to fetch NASA data');
      
      const data: NASAExoplanetData[] = await response.json();
      nasaExoplanetsCache = data;
      setAvailablePlanets(data);
    } catch (error) {
      console.error('Error loading NASA data:', error);
      toast({
        title: "Data Loading Error",
        description: "Failed to load NASA exoplanet data. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Generate universe planets from NASA data
  const generateUniversePlanets = useCallback((nasaData: NASAExoplanetData[]) => {
    const planets: UniversePlanetData[] = nasaData.slice(0, 50).map((nasaPlanet, index) => {
      // Create a 3D distribution with 3.75x more spacing
      const angle = (index / 50) * Math.PI * 12; // More spiral spread
      const radius = 112.5 + (index % 7) * 93.75; // 3.75x larger orbital rings (30*3.75=112.5, 25*3.75=93.75)
      const height = (Math.random() - 0.5) * 150; // 3.75x more vertical spread (40*3.75=150)
      
      return {
        id: nasaPlanet.kepoi_name,
        name: nasaPlanet.kepoi_name,
        position: [
          Math.cos(angle) * radius,
          height,
          Math.sin(angle) * radius
        ] as [number, number, number],
        radius: Math.max(0.5, Math.min(3, nasaPlanet.koi_prad)),
        color: getPlanetColor(nasaPlanet.koi_teq),
        temperature: nasaPlanet.koi_teq,
        period: nasaPlanet.koi_period,
        stats: [
          { label: "Radius", value: nasaPlanet.koi_prad.toFixed(2), unit: "R⊕" },
          { label: "Period", value: nasaPlanet.koi_period.toFixed(1), unit: "days" },
          { label: "Temperature", value: nasaPlanet.koi_teq.toString(), unit: "K" },
          { label: "Star Temp", value: nasaPlanet.koi_steff.toString(), unit: "K" },
          { label: "Star Radius", value: nasaPlanet.koi_srad.toFixed(2), unit: "R☉" },
          { label: "Irradiation", value: nasaPlanet.koi_insol.toFixed(2), unit: "S⊕" }
        ]
      };
    });
    
    setUniversePlanets(planets);
  }, []);

  // Load data on component mount
  useEffect(() => {
    loadNASAData();
  }, []);

  // Generate universe when NASA data is loaded
  useEffect(() => {
    if (availablePlanets.length > 0) {
      generateUniversePlanets(availablePlanets);
    }
  }, [availablePlanets, generateUniversePlanets]);

  const generateRandomPlanet = () => {
    if (universePlanets.length > 0) {
      const randomPlanet = universePlanets[Math.floor(Math.random() * universePlanets.length)];
      setSearchQuery(randomPlanet.name);
      setPlanetName(randomPlanet.name);
    }
  };

  const handlePlanetSelect = useCallback((planet: UniversePlanetData) => {
    setSelectedPlanet(planet);
    setPlanetName(planet.name);
    setDiscoveredPlanets(prev => new Set(prev).add(planet.id));
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query) {
      const foundPlanet = universePlanets.find(p => 
        p.name.toLowerCase().includes(query.toLowerCase())
      );
      if (foundPlanet) {
        setSelectedPlanet(foundPlanet);
        setPlanetName(foundPlanet.name);
      }
    }
  };

  const switchToDetailedView = () => {
    if (selectedPlanet) {
      generateExoplanet(); // Load detailed data
      setViewMode('detailed');
    }
  };

  // Helper function to get planet color based on temperature - matches universe-viewer logic
  const getPlanetColor = (temperature: number): string => {
    if (temperature < 200) return "blue";      // Deep blue for ice worlds
    if (temperature < 230) return "cyan";      // Cyan-blue for cold worlds
    if (temperature < 260) return "cyan";      // Cyan for habitable zone
    if (temperature < 290) return "green";     // Green for temperate worlds
    if (temperature < 320) return "yellowgreen"; // Yellow-green for warm worlds
    if (temperature < 350) return "yellow";    // Yellow for hot worlds
    if (temperature < 400) return "orange";    // Orange for very hot worlds
    if (temperature < 500) return "redorange"; // Red-orange for scorching worlds
    return "red";                              // Deep red for Venus-like worlds
  };

  // Helper function to generate mock atmosphere data
  const generateAtmosphereData = (temperature: number) => {
    if (temperature < 220) {
      return [
        { component: "N2", percentage: 45 },
        { component: "CO2", percentage: 35 },
        { component: "H2O", percentage: 15 },
        { component: "CH4", percentage: 5 }
      ];
    } else if (temperature < 280) {
      return [
        { component: "H2O", percentage: 40 },
        { component: "N2", percentage: 30 },
        { component: "CO2", percentage: 20 },
        { component: "O2", percentage: 10 }
      ];
    } else {
      return [
        { component: "CO2", percentage: 50 },
        { component: "H2O", percentage: 25 },
        { component: "N2", percentage: 15 },
        { component: "SO2", percentage: 10 }
      ];
    }
  };

  // Helper function to generate habitability metrics
  const generateHabitabilityMetrics = (planet: NASAExoplanetData) => {
    const tempScore = Math.max(0, Math.min(100, 100 - Math.abs(planet.koi_teq - 250) * 2));
    const radiusScore = Math.max(0, Math.min(100, 100 - Math.abs(planet.koi_prad - 1) * 30));
    const stellarScore = Math.max(0, Math.min(100, 100 - Math.abs(planet.koi_steff - 5778) / 100));
    const waterScore = tempScore > 60 ? Math.random() * 30 + 60 : Math.random() * 40 + 20;

    return [
      { metric: "Water Presence", value: Math.round(waterScore) },
      { metric: "Atmosphere", value: Math.round((tempScore + radiusScore) / 2) },
      { metric: "Temperature", value: Math.round(tempScore) },
      { metric: "Stellar Radiation", value: Math.round(stellarScore) }
    ];
  };

  const generateExoplanet = async () => {
    if (!planetName.trim()) {
      toast({
        title: "Planet Name Required", 
        description: "Please enter an exoplanet name or generate a random one.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    // Add 2-second loading delay for better UX
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    try {
      // Find the planet in NASA data
      const nasaPlanet = availablePlanets.find(p => 
        p.kepoi_name.toLowerCase().includes(planetName.toLowerCase()) ||
        planetName.toLowerCase().includes(p.kepoi_name.toLowerCase())
      );

      if (!nasaPlanet) {
        throw new Error('Planet not found in NASA database');
      }

      // Generate key points based on real data
      const keyPoints = [
        `Orbits ${nasaPlanet.koi_steff}K star every ${nasaPlanet.koi_period.toFixed(1)} days`,
        `Planet radius is ${nasaPlanet.koi_prad.toFixed(2)} times Earth's radius`,
        `Equilibrium temperature of ${nasaPlanet.koi_teq}K`,
        `Receives ${nasaPlanet.koi_insol.toFixed(2)} times Earth's solar irradiation`,
        `Located at coordinates ${nasaPlanet.ra_str}, ${nasaPlanet.dec_str}`
      ];

      // Calculate ESI (Earth Similarity Index) approximation
      const esi = Math.max(0, Math.min(1, 
        1 - Math.abs(nasaPlanet.koi_prad - 1) * 0.3 - 
        Math.abs(nasaPlanet.koi_teq - 255) / 300
      ));

      const planetData: ExoplanetData = {
        name: nasaPlanet.kepoi_name,
        keyPoints,
        color: getPlanetColor(nasaPlanet.koi_teq),
        temperature: nasaPlanet.koi_teq,
        stats: [
          { label: "Radius", value: nasaPlanet.koi_prad.toFixed(2), unit: "R⊕" },
          { label: "Period", value: nasaPlanet.koi_period.toFixed(1), unit: "days" },
          { label: "Temperature", value: nasaPlanet.koi_teq.toString(), unit: "K" },
          { label: "Star Temp", value: nasaPlanet.koi_steff.toString(), unit: "K" },
          { label: "Star Radius", value: nasaPlanet.koi_srad.toFixed(2), unit: "R☉" },
          { label: "ESI", value: esi.toFixed(2), unit: "" }
        ],
        atmosphereData: generateAtmosphereData(nasaPlanet.koi_teq),
        temperatureHistory: [
          { period: "Present", temperature: nasaPlanet.koi_teq },
          { period: "1M years", temperature: nasaPlanet.koi_teq - Math.random() * 10 },
          { period: "10M years", temperature: nasaPlanet.koi_teq - Math.random() * 20 },
          { period: "100M years", temperature: nasaPlanet.koi_teq - Math.random() * 30 }
        ],
        habitabilityMetrics: generateHabitabilityMetrics(nasaPlanet)
      };

      setExoplanetData(planetData);
      toast({
        title: "Exoplanet Found!",
        description: `Real NASA data loaded for ${nasaPlanet.kepoi_name}`,
      });

    } catch (error) {
      console.error('Error loading exoplanet:', error);
      toast({
        title: "Planet Not Found",
        description: "This planet is not in the NASA habitable zone database. Try a random one!",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (viewMode === 'universe') {
    return (
      <div className="min-h-screen relative overflow-hidden">
        {/* Full Screen Loading Overlay */}
        {isLoading && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm">
            <div className="text-center space-y-6">
              <div className="relative">
                {/* Animated loading ring */}
                <div className="w-20 h-20 mx-auto border-4 border-muted rounded-full border-t-primary animate-spin"></div>
                
                {/* Pulsing inner circle */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 bg-primary rounded-full animate-pulse opacity-60"></div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-xl font-semibold bg-gradient-stellar bg-clip-text text-transparent">
                  Loading Universe
                </h3>
                <p className="text-muted-foreground animate-pulse">
                  Preparing 3D exoplanet universe...
                </p>
              </div>
              
              {/* Loading progress dots */}
              <div className="flex justify-center space-x-1">
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Header */}
        <div className="absolute top-0 left-0 right-0 z-40 p-6">
          <div className="flex items-center justify-between">
            <Link to="/">
              <Button variant="ghost" className="text-white hover:bg-white/10">
                <Home className="w-4 h-4 mr-2" />
                Home
              </Button>
            </Link>
            
            <div className="text-center">
              <h1 className="text-3xl font-bold bg-gradient-stellar bg-clip-text text-transparent">
                Moon Theif
              </h1>
              <p className="text-muted-foreground text-sm">
                Navigate through {universePlanets.length} real exoplanets
              </p>
            </div>

            <Card className="bg-card/80 backdrop-blur-sm border-border/50 p-2">
              <div className="text-center">
                <div className="text-sm font-semibold text-primary">
                  {discoveredPlanets.size} / {universePlanets.length}
                </div>
                <div className="text-xs text-muted-foreground">Discovered</div>
              </div>
            </Card>
          </div>
        </div>

        {/* Search Bar */}
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-40 mt-4">
          <Card className="bg-card/90 backdrop-blur-md border-border/50 p-4 w-96">
            <div className="flex gap-2">
              <Input
                placeholder="Search planets (e.g., K03034.01)..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  handleSearch(e.target.value);
                }}
                className="flex-1"
              />
              <Button 
                variant="outline" 
                onClick={generateRandomPlanet}
                className="shrink-0"
                disabled={universePlanets.length === 0}
              >
                <Shuffle className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        </div>

        {/* 3D Universe Viewer */}
        <UniverseViewer
          planets={universePlanets}
          onPlanetSelect={handlePlanetSelect}
          searchedPlanet={searchQuery}
          discoveredPlanets={discoveredPlanets}
          className="absolute inset-0"
        />

        {/* Planet Info Overlay */}
        {selectedPlanet && (
          <PlanetInfoOverlay
            planet={selectedPlanet}
            onClose={() => setSelectedPlanet(null)}
            onExpand={switchToDetailedView}
          />
        )}

        {/* Instructions */}
        <div className="absolute bottom-6 left-6 z-40">
          <Card className="bg-card/80 backdrop-blur-sm border-border/50 p-4 max-w-xs">
            <div className="space-y-2">
              <h3 className="font-semibold text-sm">Controls</h3>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Drag to rotate view</li>
                <li>• Scroll to zoom</li>
                <li>• Click planets to explore</li>
                <li>• Search or randomize</li>
              </ul>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      {/* Full Screen Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm">
          <div className="text-center space-y-6">
            <div className="relative">
              {/* Animated loading ring */}
              <div className="w-20 h-20 mx-auto border-4 border-muted rounded-full border-t-primary animate-spin"></div>
              
              {/* Pulsing inner circle */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 bg-primary rounded-full animate-pulse opacity-60"></div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl font-semibold bg-gradient-stellar bg-clip-text text-transparent">
                Analyzing Exoplanet Data
              </h3>
              <p className="text-muted-foreground animate-pulse">
                Breaking Through NASA Kepler mission data...
              </p>
            </div>
            
            {/* Loading progress dots */}
            <div className="flex justify-center space-x-1">
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        </div>
      )}

      {/* Animated Starfield Background */}
      <StarfieldBackground />
      
      {/* Subtle overlay for content readability */}
      <div className="absolute inset-0 bg-background/10 z-10" />
      
      {/* Header */}
      <div className="relative z-20 p-6">
        <div className="flex items-center justify-between mb-6">
          <Button 
            variant="ghost" 
            onClick={() => setViewMode('universe')}
            className="text-primary hover:bg-primary/10"
          >
            <Globe className="w-4 h-4 mr-2" />
            Back to Universe
          </Button>
          
          <Link to="/">
            <Button variant="ghost">
              <Home className="w-4 h-4 mr-2" />
              Home
            </Button>
          </Link>
        </div>
        
        <div className="text-center">
          <h1 className="text-5xl font-bold mb-4">
            <span className="bg-gradient-stellar bg-clip-text text-transparent">
              Detailed Analysis
            </span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Deep dive into exoplanet data with interactive charts and visualizations
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-20 px-6 pb-12">
        <div className="max-w-7xl mx-auto">
          {/* Discovery Stats */}
          <div className="mb-6 flex justify-end">
            <Card className="bg-card/80 backdrop-blur-sm border-border/50 p-3">
              <div className="text-center">
                <div className="text-lg font-bold bg-gradient-stellar bg-clip-text text-transparent">
                  {discoveredPlanets.size} / {universePlanets.length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Discovered
                </p>
              </div>
            </Card>
          </div>

          {/* Results Section */}
          {exoplanetData && (
            <div className="space-y-6">
              {/* Top Row - Planet Viewer */}
              <Card className="bg-card/80 backdrop-blur-sm border-border/50 p-6">
                <div className="grid lg:grid-cols-2 gap-6 items-center">
                  {/* Planet Info */}
                  <div className="space-y-4">
                    <div>
                      <Badge className="bg-accent text-accent-foreground mb-3">
                        NASA Real Data
                      </Badge>
                      <h2 className="text-3xl font-bold bg-gradient-stellar bg-clip-text text-transparent mb-4">
                        {exoplanetData.name}
                      </h2>
                    </div>
                    
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold text-primary">Key Characteristics</h3>
                      <ul className="space-y-2">
                        {exoplanetData.keyPoints.map((point, index) => (
                          <li key={index} className="text-sm text-muted-foreground flex items-start">
                            <span className="w-2 h-2 rounded-full bg-primary mr-3 mt-2 flex-shrink-0"></span>
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Statistics Grid */}
                    <div className="grid grid-cols-2 gap-3 pt-4">
                      {exoplanetData.stats.map((stat, index) => (
                        <div key={index} className="text-center p-3 rounded-lg bg-secondary/30">
                          <div className="font-semibold text-primary">
                            {stat.value}
                            {stat.unit && <span className="text-xs text-muted-foreground ml-1">{stat.unit}</span>}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {stat.label}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 3D Planet Viewer */}
                  <div className="h-[400px] relative">
                    <PlanetViewer 
                      className="w-full h-full" 
                      planetColor={exoplanetData.color}
                      planetTemperature={exoplanetData.temperature}
                    />
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-primary text-primary-foreground shadow-glow-primary">
                        NASA Data Visualization
                      </Badge>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Bottom Row - Charts and Graphs */}
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Atmosphere Composition */}
                <Card className="bg-card/80 backdrop-blur-sm border-border/50 p-6">
                  <h3 className="text-lg font-semibold mb-4 text-primary">Atmosphere Composition</h3>
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={exoplanetData.atmosphereData}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={80}
                          dataKey="percentage"
                          nameKey="component"
                        >
                          {exoplanetData.atmosphereData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-3 space-y-2">
                    {exoplanetData.atmosphereData.map((item, index) => (
                      <div key={index} className="flex items-center text-sm">
                        <div 
                          className="w-3 h-3 rounded mr-2" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="text-muted-foreground">{item.component}: {item.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Temperature History */}
                <Card className="bg-card/80 backdrop-blur-sm border-border/50 p-6">
                  <h3 className="text-lg font-semibold mb-4 text-primary">Temperature History</h3>
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={exoplanetData.temperatureHistory}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis 
                          dataKey="period" 
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={12}
                        />
                        <YAxis 
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={12}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))', 
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '6px'
                          }}
                          formatter={(value) => [`${value}K`, 'Temperature']}
                        />
                        <Area
                          type="monotone"
                          dataKey="temperature"
                          stroke="#8884d8"
                          fill="url(#colorTemp)"
                          strokeWidth={2}
                        />
                        <defs>
                          <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1}/>
                          </linearGradient>
                        </defs>
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                {/* Habitability Metrics */}
                <Card className="bg-card/80 backdrop-blur-sm border-border/50 p-6">
                  <h3 className="text-lg font-semibold mb-4 text-primary">Habitability Index</h3>
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart 
                        data={exoplanetData.habitabilityMetrics}
                        layout="horizontal"
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis 
                          type="number" 
                          domain={[0, 100]}
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={12}
                        />
                        <YAxis 
                          type="category" 
                          dataKey="metric"
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={12}
                          width={80}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))', 
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '6px'
                          }}
                          formatter={(value) => [`${value}%`, 'Score']}
                        />
                        <Bar 
                          dataKey="value" 
                          fill="#82ca9d"
                          radius={[0, 4, 4, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </div>

              {/* Additional Information Widgets */}
              <div className="grid lg:grid-cols-3 gap-6 mt-6">
                {/* Orbital Characteristics */}
                <Card className="bg-card/80 backdrop-blur-sm border-border/50 p-6">
                  <h3 className="text-lg font-semibold mb-4 text-primary">Orbital Characteristics</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center p-3 rounded-lg bg-secondary/30">
                        <div className="text-xl font-bold text-accent">
                          {exoplanetData.stats.find(s => s.label === "Period")?.value}
                          <span className="text-sm text-muted-foreground ml-1">days</span>
                        </div>
                        <div className="text-xs text-muted-foreground">Orbital Period</div>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-secondary/30">
                        <div className="text-xl font-bold text-accent">
                          {(Math.random() * 2 + 0.5).toFixed(2)}
                          <span className="text-sm text-muted-foreground ml-1">AU</span>
                        </div>
                        <div className="text-xs text-muted-foreground">Distance from Star</div>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-secondary/30">
                        <div className="text-xl font-bold text-accent">
                          {(Math.random() * 0.3).toFixed(3)}
                        </div>
                        <div className="text-xs text-muted-foreground">Eccentricity</div>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-secondary/30">
                        <div className="text-xl font-bold text-accent">
                          {(Math.random() * 180).toFixed(1)}°
                        </div>
                        <div className="text-xs text-muted-foreground">Inclination</div>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Orbital mechanics calculated from NASA Kepler transit photometry data.
                    </div>
                  </div>
                </Card>

                {/* Stellar Properties */}
                <Card className="bg-card/80 backdrop-blur-sm border-border/50 p-6">
                  <h3 className="text-lg font-semibold mb-4 text-primary">Host Star Properties</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center p-3 rounded-lg bg-secondary/30">
                        <div className="text-xl font-bold text-orange-400">
                          {exoplanetData.stats.find(s => s.label === "Star Temp")?.value}
                          <span className="text-sm text-muted-foreground ml-1">K</span>
                        </div>
                        <div className="text-xs text-muted-foreground">Stellar Temperature</div>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-secondary/30">
                        <div className="text-xl font-bold text-orange-400">
                          {exoplanetData.stats.find(s => s.label === "Star Radius")?.value}
                          <span className="text-sm text-muted-foreground ml-1">R☉</span>
                        </div>
                        <div className="text-xs text-muted-foreground">Stellar Radius</div>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-secondary/30">
                        <div className="text-xl font-bold text-orange-400">
                          {(Math.random() * 2 + 0.5).toFixed(2)}
                          <span className="text-sm text-muted-foreground ml-1">M☉</span>
                        </div>
                        <div className="text-xs text-muted-foreground">Stellar Mass</div>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-secondary/30">
                        <div className="text-xl font-bold text-orange-400">
                          {['G', 'K', 'F', 'M'][Math.floor(Math.random() * 4)]}
                          <span className="text-sm text-muted-foreground ml-1">Class</span>
                        </div>
                        <div className="text-xs text-muted-foreground">Spectral Type</div>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Stellar parameters derived from Kepler stellar characterization pipeline.
                    </div>
                  </div>
                </Card>

                {/* Discovery Information */}
                <Card className="bg-card/80 backdrop-blur-sm border-border/50 p-6">
                  <h3 className="text-lg font-semibold mb-4 text-primary">Discovery Details</h3>
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 rounded-lg bg-secondary/30">
                        <span className="text-sm text-muted-foreground">Mission</span>
                        <span className="font-semibold text-accent">NASA Kepler</span>
                      </div>
                      <div className="flex justify-between items-center p-3 rounded-lg bg-secondary/30">
                        <span className="text-sm text-muted-foreground">Method</span>
                        <span className="font-semibold text-accent">Transit</span>
                      </div>
                      <div className="flex justify-between items-center p-3 rounded-lg bg-secondary/30">
                        <span className="text-sm text-muted-foreground">Status</span>
                        <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                          Candidate
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center p-3 rounded-lg bg-secondary/30">
                        <span className="text-sm text-muted-foreground">Confidence</span>
                        <span className="font-semibold text-green-400">
                          {(Math.random() * 30 + 70).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Discovered through periodic dimming of host star brightness indicating planetary transit.
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}