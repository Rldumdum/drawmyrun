type AllMarkers = {
  longitude: number;
  latitude: number;
};

type Marker = {
  id: number,
  longitude: number,
  latitude: number
}

type MarkerType ={
  id: number;
  longitude: number;
  latitude: number;
  label: string;
}

type RouteData = {
  type: "Feature";
  properties: Record<string, unknown>;
  geometry: {
    type: "LineString";
    coordinates: [number, number][];
  };
}

type SearchResult  = {
  id: string;
  text: string;
  place_name: string;
  center: [number, number];
  properties?: Record<string, unknown>;
  geometry?: {
    type: string;
    coordinates: [number, number];
  };
}

type GeocodeResponse = {
  features: SearchResult[];
  query: string[];
  type: string;
}

type DirectionsResponse  ={
  routes: Array<{
    geometry: {
      type: "LineString";
      coordinates: [number, number][];
    };
    distance: number;
    duration: number;
  }>;
  waypoints: Array<{
    name: string;
    location: [number, number];
  }>;
}