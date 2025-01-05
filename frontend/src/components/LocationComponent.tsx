import React from "react";
import {
  APIProvider,
  Map,
  Marker,
  InfoWindow,
  AdvancedMarker,
} from "@vis.gl/react-google-maps";
import { Loader } from "@googlemaps/js-api-loader";

const GOOGLE_MAPS_API_KEY = "AIzaSyBnCh2ugCrcyKDKT3HHry5KjkjS4ps4PT0";
const BORDER_RADIUS = "12px";
const MAP_STYLES = [
  {
    featureType: "all",
    elementType: "labels.text.fill",
    stylers: [{ color: "#ffffff" }],
  },
  {
    featureType: "all",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#2c3440" }, { weight: 2 }, { gamma: 0.84 }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#2b4365" }],
  },
  {
    featureType: "landscape",
    elementType: "geometry.fill",
    stylers: [{ color: "#2d364a" }],
  },
  {
    featureType: "poi",
    elementType: "geometry",
    stylers: [{ color: "#3a4a67" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#445571" }, { lightness: -5 }],
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#3d4a63" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text",
    stylers: [{ visibility: "on" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry.fill",
    stylers: [{ color: "#2d4a4a" }],
  },
  {
    featureType: "landscape.man_made.building",
    elementType: "geometry.fill",
    stylers: [{ color: "#334155" }],
  },
];

interface LocationMapProps {
  location: string;
  home?: string;
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
  const [isLoading, setIsLoading] = React.useState(true);
  const [mapsLoaded, setMapsLoaded] = React.useState(false);

  React.useEffect(() => {
    const loader = new Loader({
      apiKey: GOOGLE_MAPS_API_KEY,
      version: "weekly",
      libraries: ["places", "geometry"],
    });

    loader
      .load()
      .then(() => {
        setMapsLoaded(true);
      })
      .catch((error) => {
        console.error("Error loading Google Maps:", error);
      });
  }, []);

  React.useEffect(() => {
    if (mapsLoaded && isValidLocation(location)) {
      const geocoder = new google.maps.Geocoder();

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
          setIsLoading(false);
        }
      );
    }
  }, [location, mapsLoaded]);
  if (!isValidLocation(location) || !position || !mapsLoaded) {
    return null;
  }

  const locationName = location;

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
          gestureHandling="cooperative"
          disableDefaultUI
          styles={MAP_STYLES}
          backgroundColor="#1c1c1e"
          clickableIcons={false}
        >
          <Marker position={position}>
            {/*  InfoWindow is not working, need to use AdvancedMarker but
                then need MAP ID and stuff, extra work
            <InfoWindow
              position={position}
              pixelOffset={new google.maps.Size(0, -5)}
            >
              <div
                style={{
                  color: "#ffffff",
                  fontFamily:
                    '-apple-system, Geist, "SF Pro Text", "SF Pro Icons", "Helvetica Neue", Arial, sans-serif',
                  fontSize: "14px",
                  fontWeight: 500,
                  lineHeight: 1.4,
                  whiteSpace: "nowrap",
                  background: "rgba(36, 36, 38, 0.9)",
                  backdropFilter: "blur(6px)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "12px",
                  padding: "10px",
                  margin: 0,
                }}
              >
                {locationName}
              </div>
            </InfoWindow> */}
          </Marker>
        </Map>
      </APIProvider>
    </div>
  );
};

export default LocationMap;
