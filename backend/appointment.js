const express = require("express");
const { google } = require("googleapis");
const sgMail = require("@sendgrid/mail");
require("dotenv").config();
const router = express.Router();

// Load credentials from environment variables (Google JWT in Cloud)
const FLOORING_SHEET_ID = process.env.FLOORING_SHEET_ID; // Use a separate SHEET_ID for flooring
const GOOGLE_CREDENTIALS_BASE64 = process.env.GOOGLE_CREDENTIALS_BASE64;

// Load SendGrid credentials
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const SENDER_EMAIL = process.env.SENDER_EMAIL;

// Decode the base64 Google credentials
const decodedCredentials = JSON.parse(Buffer.from(GOOGLE_CREDENTIALS_BASE64, "base64").toString("utf-8"));

// Set SendGrid API key
sgMail.setApiKey(SENDGRID_API_KEY);

async function accessSpreadsheet() {
    const auth = new google.auth.GoogleAuth({
        credentials: {
            client_email: decodedCredentials.client_email,
            private_key: decodedCredentials.private_key.replace(/\\n/g, '\n')
        },
        scopes: ["https://www.googleapis.com/auth/spreadsheets"]
    });
    return google.sheets({ version: "v4", auth });
}

// ✅ API Route to Save Appointment Data & Send Email
router.post("/submit-appointment", async (req, res) => {
    try {
        const sheets = await accessSpreadsheet();
        const appointmentData = req.body;
        const emailToCheck = appointmentData.email;

        // Fetch existing emails from Google Sheets
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: FLOORING_SHEET_ID,
            range: "Appointments!B:B", // Column B (Emails)
        });

        const existingEmails = response.data.values ? response.data.values.flat() : [];

        // Check if the email already exists
        if (existingEmails.includes(emailToCheck)) {
            return res.status(400).json({ error: "Email already exists. Appointment not submitted." });
        }

        // If email is unique, append new appointment
        const values = [[
            appointmentData.name,
            appointmentData.email,
            appointmentData.phone,
            appointmentData.requirements,
            appointmentData.date
        ]];

        await sheets.spreadsheets.values.append({
            spreadsheetId: FLOORING_SHEET_ID,
            range: "Appointments!A:E", // Adjusted based on the number of fields
            valueInputOption: "RAW",
            insertDataOption: "INSERT_ROWS",
            requestBody: { values },
        });

        // ✅ Send Email Notification
        const adminEmailMessage = {
            to: ADMIN_EMAIL,
            from: SENDER_EMAIL,
            subject: "New Flooring Appointment Submission",
            text: 
                `A new flooring appointment has been submitted:\n
                Name: ${appointmentData.name}\n
                Email: ${appointmentData.email}\n
                Phone: ${appointmentData.phone}\n
                Requirements: ${appointmentData.requirements}\n
                Date: ${appointmentData.date}`
        };

        const userEmailMessage = {
            to: appointmentData.email,
            from: SENDER_EMAIL,
            subject: "Appointment Confirmation",
            text: 
                `Thank you for your flooring appointment, ${appointmentData.name}!\n
                We have received your request and will get back to you soon.\n\n
                Appointment Details:\n
                - Name: ${appointmentData.name}\n
                - Email: ${appointmentData.email}\n
                - Phone: ${appointmentData.phone}\n
                - Requirements: ${appointmentData.requirements}\n
                - Date: ${appointmentData.date}`
        };

        await sgMail.send(adminEmailMessage);
        await sgMail.send(userEmailMessage);

        res.status(200).json({ message: "Appointment data saved successfully and emails sent!" });

    } catch (error) {
        console.error("❌ Error:", error);
        res.status(500).json({ error: "Failed to save appointment data or send emails" });
    }
});

// Example route
router.get("/", (req, res) => {
    res.send("Google Sheets Flooring Appointment API is working!");
});

module.exports = router;
