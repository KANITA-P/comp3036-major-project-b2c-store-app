import { client } from "./client.js";
import { seed } from "./seed.js";

try {
  await seed();
} catch (error) {
  console.error(error);
  process.exitCode = 1;
} finally {
  await client.db.$disconnect();
}
