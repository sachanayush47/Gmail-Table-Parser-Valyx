import fs from "fs";
import asyncHandler from "express-async-handler";
import * as fsExtra from "fs-extra";

import { dateInRange, isDateValid } from "../util/dateUtil.js";
import { getPdfs } from "../util/pdfDownload.js";
import { runPythonTableParser, checkFolderExist, convertCsvToJson } from "../util/miscUtil.js";

/**
 * DESC: Downloads PDF from emails and Parses table from PDF
 * ROUTE: GET /api/v1/pdf/generate-data-from-email/
 */
export const generateData = asyncHandler(async (req, res) => {
    checkFolderExist("downloadedPdfs");
    await getPdfs();
    await runPythonTableParser();

    // Delete all PDF after generating data.csv
    fsExtra.emptyDirSync("downloadedPdfs");

    const csvToJson = await convertCsvToJson();
    res.status(200).json(csvToJson);
});

/**
 * DESC: Find records within a date
 * ROUTE: GET /api/v1/pdf/find-records?startDate={DATE}&endDate={DATE}
 *              Query string is optional
 *              Date format should be: MM/DD/YYYY
 *
 *
 * IF the dates are not provided then return all records.
 * If only startDate is provided then return all records from that date.
 * If only endDate is provided then return all records till that date.
 * If both startDate and endDate is provided then return within the range.
 *
 */
export const findRecords = asyncHandler(async (req, res) => {
    let { startDate, endDate } = req.query;

    // Default start date
    if (!startDate) {
        startDate = "01 Jan 1970";
    }

    // Default end date
    if (!endDate) {
        endDate = "01 Jan 2070";
    }

    // Check if the dates are valid
    if (!isDateValid(startDate) || !isDateValid(endDate)) {
        throw new Error("Invalid date");
    }

    // Check if csv file exist
    const isExist = fs.existsSync("data.csv");
    if (!isExist) {
        throw new Error("Data does not exist, please first generate data");
    }

    const csvToJson = await convertCsvToJson();
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);

    // Response data
    const result = [];

    // Loop through 'csvToJson'
    for (let index = 0; index < csvToJson.length; index++) {
        const record = csvToJson[index];
        const date = record.Date;

        const dateObj = new Date(date);

        let isDateInRangeFound = false;

        // Add only those records which has valid date
        if (isDateValid(date) && dateInRange(startDateObj, endDateObj, dateObj)) {
            result.push(record);
            isDateInRangeFound = true;
        } else if (isDateInRangeFound) {
            break;
        }
    }

    res.status(200).json(result);
});

/**
 * DESC: Find balance by date (Returns the first date encountered)
 * ROUTE: GET /api/v1/pdf/get-balance?date={DATE}
 *                  Date format should be: MM/DD/YYYY
 *
 *
 * If multiple records present on a date then only send the balance
 * from the first matching record
 */
export const findBalanceByDate = asyncHandler(async (req, res) => {
    const date = req.query.date;

    if (!date) {
        res.status(422);
        throw new Error("Date is not provided");
    }

    if (!isDateValid(date)) {
        res.status(422);
        throw new Error("Invalid date");
    }

    // Check if csv file exist
    const isExist = fs.existsSync("data.csv");
    if (!isExist) {
        res.status(404);
        throw new Error("Data does not exist, please first generate data");
    }

    const csvToJson = await convertCsvToJson();
    const dateObj = new Date(date);

    // Response data
    const result = { balance: null };

    // Loop through 'csvToJson'
    for (let index = 0; index < csvToJson.length; ++index) {
        const record = csvToJson[index];
        const currDate = record.Date;

        const currDateObj = new Date(currDate);

        if (isDateValid(currDate) && currDateObj.getTime() == dateObj.getTime()) {
            result.balance = record.Balance;
            break;
        }
    }

    res.status(200).json(result);
});
