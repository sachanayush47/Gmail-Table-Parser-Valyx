import fsPromise from "fs/promises";
import path from "path";
import { google } from "googleapis";

import { authorize } from "../util/googleAuth.js";
import { GMAIL_QUERY } from "../config/constants.js";

// Downloads pdf at 'downloadedPDfs/'
export async function getPdfs() {
    const auth = await authorize();
    const gmail = google.gmail({ version: "v1", auth });
    const messageIdList = await getMessageIdList(gmail);
    const messageBodyList = await getMessageBodyList(gmail, messageIdList);
    const pdfBase64List = await getPdfBase64List(gmail, messageBodyList);
    await saveAsPdf(pdfBase64List);
}

// Finds messages with the help query and return List of IDs of messages
async function getMessageIdList(gmail) {
    const { data } = await gmail.users.messages.list({
        userId: "me",
        q: GMAIL_QUERY,
    });

    return data;
}

// Returns body of messages in parts
async function getMessageBodyList(gmail, messageIdList) {
    const messageBodyList = [];

    for (let message = 0; message < messageIdList.resultSizeEstimate; ++message) {
        const messageId = messageIdList.messages[message].id;
        const messageBodyParts = await getMessageBodyPartsById(gmail, messageId);
        messageBodyList.push({ messageId, messageBodyParts });
    }

    return messageBodyList;
}

// Retreives message body
async function getMessageBodyPartsById(gmail, messageId) {
    const { data } = await gmail.users.messages.get({
        userId: "me",
        id: messageId,
        format: "full",
    });

    return data.payload.parts;
}

// Retreives the PDFs base64
async function getPdfBase64List(gmail, messageBodyList) {
    const pdfBase64List = [];

    for (let item = 0; item < messageBodyList.length; ++item) {
        const { messageId, messageBodyParts } = messageBodyList[item];

        for (let part = 0; part < messageBodyParts.length; ++part) {
            if (messageBodyParts[part].mimeType === "application/pdf") {
                const pdfBase64 = await gmail.users.messages.attachments.get({
                    id: messageBodyParts[part].body.attachmentId,
                    userId: "me",
                    messageId: messageId,
                });

                pdfBase64List.push(pdfBase64.data.data);
            }
        }
    }

    return pdfBase64List;
}

// Saves the PDF to disk
async function saveAsPdf(pdfBase64List) {
    for (let index = 0; index < pdfBase64List.length; ++index) {
        await fsPromise.writeFile(
            path.join(process.cwd(), "downloadedPdfs", `${Date.now()}.pdf`),
            Buffer.from(pdfBase64List[index], "base64")
        );
    }
}
