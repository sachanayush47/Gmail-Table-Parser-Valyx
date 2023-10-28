import csv from "csvtojson";
import { PythonShell } from "python-shell";
import fs from "fs";
import path from "path";

export function runPythonTableParser() {
    return new Promise((resolve, reject) => {
        try {
            PythonShell.run(path.join("util", "tableParser.py"), null).then(() => {
                console.log("Table parsed");
                resolve();
            });
        } catch (error) {
            console.log("Error in executing python script");
            reject(error);
        }
    });
}

export function checkFolderExist(path) {
    const isExist = fs.existsSync(path);
    if (!isExist) {
        fs.mkdirSync(path);
    }
}

export async function convertCsvToJson() {
    try {
        const json = await csv().fromFile(`data.csv`);
        return json;
    } catch (error) {
        console.log(error.message);
    }
}
