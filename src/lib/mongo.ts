import { MongoClient } from "mongodb";
import { z } from "zod";

async function connectToClient(connectionUri: string) {
	const client = new MongoClient(connectionUri);
	return client;
}

// Schema for the request headers
const headerSchema = z.object({
	authorization: z
		.string()
		.startsWith("mongodb")
		.regex(
			new RegExp(
				"^(mongodb(?:\\+srv)?://)(?:([^:@]+):([^@]*)@)?([^/?#,]+)(?::(\d+))?(?:/([^?]*))?(?:\\?([^#]*))?$",
				"gm"
			)
		),
});

export { connectToClient, headerSchema };
