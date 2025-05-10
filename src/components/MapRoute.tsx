import { Map } from "@vis.gl/react-google-maps";
import Route from "./Route";

const mapOptions = {
  mapId: "49ae42fed52588c3",
  defaultCenter: { lat: 22, lng: 0 },
  defaultZoom: 3,
  gestureHandling: "greedy",
  disableDefaultUI: true,
};

export const MapRoute = () => {
  return (
    <div className="w-full mb-4">
      <div className="w-full h-[400px] relative">
        <Map
          className="w-full h-full"
          style={{
            width: "100%",
            height: "100%",
            position: "absolute",
            top: 0,
            left: 0,
          }}
          {...mapOptions}
        >
          <Route />
        </Map>
      </div>
    </div>
  );
};
