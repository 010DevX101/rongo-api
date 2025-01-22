import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { connectToClient, headerSchema } from "../../lib/mongo.js";
import { z } from "zod";

const app = new Hono();

// Schema for the request body
const bodySchema = z.object({
	database: z.string(),
	collection: z.string(),
	documents: z.array(z.record(z.any())),
});

app.post(
	"/",
	zValidator("json", bodySchema),
	zValidator("header", headerSchema),

	async (c) => {
		let client;
		try {
			client = await connectToClient(
				c.req.header("authorization") as string
			);
			const parsedBody = bodySchema.parse(await c.req.json());

			const db = client.db(parsedBody.database);
			const collection = db.collection(parsedBody.collection);
			const result = await collection.insertMany(parsedBody.documents);

			await client.close();
			return c.json({ insertedIds: result.insertedIds });
		} catch {
			if (client) {
				await client.close();
			}
			return c.json({ success: false, message: "An error occurred" }, 500);
		}
	}
);

app.all("/", (c) => {
	return c.json({ success: false, message: "Method not allowed" }, 405);
});

export default app;
