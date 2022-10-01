// src/server/router/index.ts
import { createRouter } from "./context";
import superjson from "superjson";

import { scooterLocationProvider } from "./scooter-location";

export const appRouter = createRouter()
  .transformer(superjson)
  .merge("scooter.", scooterLocationProvider);

// export type definition of API
export type AppRouter = typeof appRouter;
