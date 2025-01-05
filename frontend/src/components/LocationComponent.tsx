import React from "react";
import {
  AdvancedMarker,
  APIProvider,
  Map,
  Pin,
} from "@vis.gl/react-google-maps";
import { Loader } from "@googlemaps/js-api-loader";
import { useQuery } from "@tanstack/react-query";

const useGoogleMapsApiKey = () => {
  return useQuery({
    queryKey: ["googleMapsApiKey"],
    queryFn: async () => {
      const response = await fetch(
        "https://api.slugtistics.com/api/pyback/google_maps_api_key"
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      return data.key;
    },
    staleTime: Infinity,
    gcTime: Infinity,
    retry: 2,
  });
};

const BORDER_RADIUS = "12px";

interface LocationMapProps {
  location: string;
  className?: string;
  style?: React.CSSProperties;
  height?: string | number;
}

interface GeocodeResult {
  lat: number;
  lng: number;
}

const isValidLocation = (location: string): boolean => {
  if (!location) return false;
  const invalidLocations = ["Online", "N/A", "Remote Instruction", "TBD"];
  return !invalidLocations.includes(location) && !location.includes("TBD");
};

const LocationMap: React.FC<LocationMapProps> = ({
  location,
  className,
  style,
  height = "300px",
}) => {
  const [position, setPosition] = React.useState<GeocodeResult | null>(null);
  const [mapsLoaded, setMapsLoaded] = React.useState(false);
  const { data: GOOGLE_MAPS_API_KEY, isLoading: isKeyLoading } =
    useGoogleMapsApiKey();

  React.useEffect(() => {
    if (!GOOGLE_MAPS_API_KEY) return;

    const loader = new Loader({
      apiKey: GOOGLE_MAPS_API_KEY,
      version: "weekly",
      libraries: ["places", "geometry", "marker"],
    });

    loader
      .load()
      .then(() => {
        setMapsLoaded(true);
      })
      .catch((error) => {
        console.error("Error loading Google Maps:", error);
      });
  }, [GOOGLE_MAPS_API_KEY]);
  const getFormattedAddress = (loc: string) => {
    if (/\bTA\b/.test(loc)) {
      return "UCSC Theater Arts Center Mainstage";
    }
    if (loc.includes("Hum & Soc Sci")) {
      return "UC Santa Cruz humanities and social science";
    }
    if (loc.includes("Gamelan Stu")) {
      return "UC Santa Cruz Gamelan Studio";
    }
    if (loc.includes("Music Center")) {
      return "UCSC Music Center";
    }
    if (loc.includes("Steven Acad")) {
      return "Stevenson Academic 150";
    }

    return `UC Santa Cruz ${loc}`;
  };
  React.useEffect(() => {
    if (mapsLoaded && isValidLocation(location)) {
      const geocoder = new google.maps.Geocoder();

      geocoder.geocode(
        {
          address: getFormattedAddress(location),
        },
        (results, status) => {
          if (
            status === google.maps.GeocoderStatus.OK &&
            results?.[0]?.geometry?.location
          ) {
            const { lat, lng } = results[0].geometry.location.toJSON();
            setPosition({ lat, lng });
          }
        }
      );
    }
  }, [location, mapsLoaded]);

  if (
    !isValidLocation(location) ||
    !position ||
    !GOOGLE_MAPS_API_KEY ||
    isKeyLoading
  ) {
    return null;
  }

  const MarkerContent = () => (
    <div
      className="marker-content"
      style={{
        color: "#fff",
        background: "#333",
        padding: "5px 10px",
        borderRadius: "4px",
        position: "relative",
        transform: "translate(-50%, -100%)",
        top: "-10px",
        whiteSpace: "nowrap",
      }}
    >
      {location}
    </div>
  );

  return (
    <div
      style={{
        height,
        width: "100%",
        borderRadius: BORDER_RADIUS,
        overflow: "hidden",
        ...style,
      }}
      className={className}
    >
      <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
        <Map
          defaultZoom={17}
          defaultCenter={position}
          mapId="4fa4ec527cd2f0dc"
          disableDefaultUI
          gestureHandling="cooperative"
        >
          <AdvancedMarker position={position}>
            <Pin
              background={"#EA4335"}
              borderColor={"#fff"}
              glyphColor={"#fff"}
              scale={1}
            />
          </AdvancedMarker>
        </Map>
      </APIProvider>
    </div>
  );
};

export default LocationMap;
