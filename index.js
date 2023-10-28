import express from "express";

import errorHandler from "./middleware/errorHandler.js";
import pdfRouter from "./routes/pdf.routes.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1/pdf", pdfRouter);

app.use(errorHandler);

const PORT = 8000;
app.listen(PORT, () => console.log("server running on port " + PORT));
