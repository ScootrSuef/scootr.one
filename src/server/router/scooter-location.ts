import { createProtectedRouter } from "../utils";
import { z } from "zod";
import Coordinates from '../../utils/Coordinates';

// Example router with queries that can only be hit if the user requesting is signed in
export const scooterLocationProvider = createProtectedRouter()
    .query("find", {
        input: z.object({
            coordinates: z.object({
                latitude: z.number(),
                longitude: z.number()
            }),
            providers: z.array(z.string()).default([]),
            limit: z.number().default(10),
            distance: z.number().default(250)
        }),
            resolve({ input, ctx }) {
            const coordinatesOffset = getCoordinatesOffsetByDistanceInMetres(input.coordinates, input.distance);

            return ctx.prisma.scooterLocation.findMany({
                where: {
                    latitude: {
                        gte: input.coordinates.latitude - coordinatesOffset.latitude,
                        lte: input.coordinates.latitude + coordinatesOffset.latitude
                    },
                    longitude: {
                        gte: input.coordinates.longitude - coordinatesOffset.longitude,
                        lte: input.coordinates.longitude + coordinatesOffset.longitude
                    },
                    ...(input.providers.length > 0 ? {
                        scooter: {
                            provider: {
                                id: { in: input.providers }
                            }
                        }
                    }: {})
                }
            })
        },
    })
    .query("findByDistance", {
        input: z.object({
            coordinates: z.object({
                latitude: z.number(),
                longitude: z.number()
            }),
            distance: z.number().default(250),
            providers: z.array(z.string()).default([])
        }),
        resolve({ input, ctx }) {
            const coordinates = new Coordinates(input.coordinates.latitude, input.coordinates.longitude);
            const coordinatesOffset = coordinates.getCoordinatesOffset(input.distance);

            return ctx.prisma.scooterLocation.findMany({
                where: {
                    latitude: {
                        gte: input.coordinates.latitude - coordinatesOffset.latitude,
                        lte: input.coordinates.latitude + coordinatesOffset.latitude
                    },
                    longitude: {
                        gte: input.coordinates.longitude - coordinatesOffset.longitude,
                        lte: input.coordinates.longitude + coordinatesOffset.longitude
                    },
                    scooter: {
                        provider: {
                            id: {
                                in: input.providers
                            }
                        }
                    }
                }
            })
        }
    });
