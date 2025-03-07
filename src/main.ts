import express from "express";
import { ConfigService } from "./utils/config/config.service";
import appealRouter from "./routes/appeal.router";

const config = new ConfigService();

const app = express();
const port = config.get("APPLICATION_PORT") || 3000;

app.use(express.json());

app.use("/appeals", appealRouter);

app.listen(port, () => {
	console.log(`Server is running on port ${port}`);
});
