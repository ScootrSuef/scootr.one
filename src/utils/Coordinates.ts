import { loggerLink } from '@trpc/client/links/loggerLink';


type DecimalDegreesCoordinates = {
    latitude: number;
    longitude: number;
}
type DegreesMinutesSecondsCoordinates = {
    latitude: {
        degrees: number;
        minutes: number;
        seconds: number;
    };
    longitude: {
        degrees: number;
        minutes: number;
        seconds: number;
    };
}
type DegreesMinutesCoordinates = {
    latitude: {
        degrees: number;
        minutes: number;
    };
    longitude: {
        degrees: number;
        minutes: number;
    };
}

export default class Coordinates {
    static PI_180: number = Math.PI / 180;
    static EARTH_RADIUS: number = 6371e3;

    constructor(public latitude: number, public longitude: number) {
        this.latitude = latitude;
        this.longitude = longitude;
    }
    public static parse(coordinates: string) {
        const regex = /(\d{1,3})°(\d{1,2})'(\d{1,2})"([NS])\s(\d{1,3})°(\d{1,2})'(\d{1,2})"([EW])/;
        const matches = coordinates.match(regex);
        if (matches) {
            const latitude = parseInt(matches[1]!) + parseInt(matches[2]!) / 60 + parseInt(matches[3]!) / 3600;
            const longitude = parseInt(matches[5]!) + parseInt(matches[6]!) / 60 + parseInt(matches[7]!) / 3600;

            return new Coordinates(
                matches[4] === "S" ? -latitude : latitude,
                matches[8] === "W" ? -longitude : longitude
            );
        }
        throw new Error("Invalid coordinates");
    }
    public static from(options: {
        dd: DecimalDegreesCoordinates,
        dms: DegreesMinutesSecondsCoordinates,
        dmm: DegreesMinutesCoordinates
    }): Coordinates {
        if (options.dd) {
            return new Coordinates(options.dd.latitude, options.dd.longitude);
        }
        if (options.dms) {
            return new Coordinates(
                options.dms.latitude.degrees + options.dms.latitude.minutes / 60 + options.dms.latitude.seconds / 3600,
                options.dms.longitude.degrees + options.dms.longitude.minutes / 60 + options.dms.longitude.seconds / 3600
            );
        }
        if (options.dmm) {
            return new Coordinates(
                options.dmm.latitude.degrees + options.dmm.latitude.minutes / 60,
                options.dmm.longitude.degrees + options.dmm.longitude.minutes / 60
            );
        }

        throw new Error("No valid options provided");
    }
    public toDD(): DecimalDegreesCoordinates {
        return {
            latitude: this.latitude,
            longitude: this.longitude
        };
    }
    public toDMS(): DegreesMinutesSecondsCoordinates {
        const latitude = {
            degrees: Math.floor(this.latitude),
            minutes: Math.floor((this.latitude - Math.floor(this.latitude)) * 60),
            seconds: Math.floor(((this.latitude - Math.floor(this.latitude)) * 60 - Math.floor((this.latitude - Math.floor(this.latitude)) * 60)) * 60)
        };
        const longitude = {
            degrees: Math.floor(this.longitude),
            minutes: Math.floor((this.longitude - Math.floor(this.longitude)) * 60),
            seconds: Math.floor(((this.longitude - Math.floor(this.longitude)) * 60 - Math.floor((this.longitude - Math.floor(this.longitude)) * 60)) * 60)
        };
        return {
            latitude,
            longitude
        };
    }
    public toDMM(): DegreesMinutesCoordinates {
        const latitude = {
            degrees: Math.floor(this.latitude),
            minutes: Math.floor((this.latitude - Math.floor(this.latitude)) * 60)
        };
        const longitude = {
            degrees: Math.floor(this.longitude),
            minutes: Math.floor((this.longitude - Math.floor(this.longitude)) * 60)
        };

        return {
            latitude,
            longitude
        };
    }

    public getDistanceBetween(to: Coordinates): number {
        const latFrom = this.latitude * Coordinates.PI_180;
        const latTo = to.latitude * Coordinates.PI_180;
        const longFrom = (to.latitude-this.latitude) * Coordinates.PI_180;
        const n4 = (this.longitude-to.longitude) * Coordinates.PI_180;
        const a = Math.sin(longFrom/2) * Math.sin(longFrom/2) +
                Math.cos(latFrom) * Math.cos(latTo) *
                Math.sin(n4/2) * Math.sin(n4/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const d = Coordinates.EARTH_RADIUS * c;

        return d;
    }
    // 52.34533540955949, 9.72247431469563
    public getCoordinatesOffset(distance: number): DecimalDegreesCoordinates {
        const latFromRad = this.latitude * Coordinates.PI_180;
        const longFromRad = this.longitude * Coordinates.PI_180;

        const latToRad = Math.asin(Math.sin(latFromRad) * Math.cos(distance/Coordinates.EARTH_RADIUS) +
            Math.cos(latFromRad) * Math.sin(distance/Coordinates.EARTH_RADIUS) * Math.cos(0));

        const longToRad = longFromRad + Math.atan2(Math.sin(0) * Math.sin(distance/Coordinates.EARTH_RADIUS) * Math.cos(latFromRad),
            Math.cos(distance/Coordinates.EARTH_RADIUS) - Math.sin(latFromRad) * Math.sin(latToRad));
        return {
            latitude: Math.abs((this.latitude * Coordinates.PI_180) - (latToRad * Coordinates.PI_180)),
            longitude: Math.abs((this.longitude * Coordinates.PI_180) - (longToRad * Coordinates.PI_180))
        }
    }
}