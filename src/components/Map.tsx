import { NextPage } from "next";
import useGeolocation from "react-hook-geolocation";
import Coordinates from "../utils/Coordinates";


const Map: NextPage = () => {
    let counter: number = 0;
    let geoInfo = useGeolocation({
        maximumAge: 15000,
        timeout: 12000,
    });
    let location = geoInfo.latitude && geoInfo.longitude ? new Coordinates(geoInfo.latitude, geoInfo.longitude) : null;

    return <>
        <div>
            <span className="block" onLoad={()=>{counter++}}>
                Coordinates: {location?.latitude}, {location?.longitude}
            </span>
            <span className="block">
                new Coordinates: {location &&
                    <div>
                        {location.getCoordinatesOffset(1000).latitude + geoInfo.latitude}, {location.getCoordinatesOffset(1000).longitude + geoInfo.longitude}
                    </div>
                }
            </span>
        </div>
    </>
}
export default Map;