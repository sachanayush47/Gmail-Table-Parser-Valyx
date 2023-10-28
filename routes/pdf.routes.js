import express from "express";
import { generateData, findBalanceByDate, findRecords } from "../controllers/pdf.controller.js";

const router = express.Router();

router.get("/generate-data-from-email", generateData);

router.get("/find-records", findRecords);

router.get("/get-balance", findBalanceByDate);

export default router;
