import path from "path";
import { authenticate } from "@google-cloud/local-auth";
import { google } from "googleapis";
import fsPromise from "fs/promises";

import { GMAIL_READ_ONLY_SCOPE } from "../config/constants.js";
const SCOPES = [GMAIL_READ_ONLY_SCOPE];
const TOKEN_PATH = path.join(process.cwd(), "config", "token.json");
const CREDENTIALS_PATH = path.join(process.cwd(), "config", "credentials.json");

export async function authorize() {
    let client = await loadSavedCredentialsIfExist();
    if (client) {
        return client;
    }
    client = await authenticate({
        scopes: SCOPES,
        keyfilePath: CREDENTIALS_PATH,
    });
    if (client.credentials) {
        await saveCredentials(client);
    }
    return client;
}

async function loadSavedCredentialsIfExist() {
    try {
        const content = await fsPromise.readFile(TOKEN_PATH);
        const credentials = JSON.parse(content);
        return google.auth.fromJSON(credentials);
    } catch (err) {
        return null;
    }
}

async function saveCredentials(client) {
    const content = await fsPromise.readFile(CREDENTIALS_PATH);
    const keys = JSON.parse(content);
    const key = keys.installed || keys.web;
    const payload = JSON.stringify({
        type: "authorized_user",
        client_id: key.client_id,
        client_secret: key.client_secret,
        refresh_token: client.credentials.refresh_token,
    });
    await fsPromise.writeFile(TOKEN_PATH, payload);
}
