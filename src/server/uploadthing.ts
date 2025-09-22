import { UTApi } from "uploadthing/server";
import { env } from "~/env";

// Single UTApi instance configured with the app token
export const utapi = new UTApi({ token: env.UPLOADTHING_TOKEN });

export default utapi;
