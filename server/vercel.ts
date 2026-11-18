import { getRequestListener } from "@hono/node-server";
import app from "../api/boot";

// El runtime Node de Vercel invoca el handler con (req, res). getRequestListener
// traduce esas peticiones al fetch de Hono, que es el adaptador soportado; un
// objeto { fetch } solo lo entiende el runtime Edge.
export default getRequestListener(app.fetch);
