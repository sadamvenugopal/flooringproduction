const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3003;

// ✅ Allowed Origins
const allowedOrigins = [
    'http://ess8o0ogo8gkkc0kogockswo.82.25.109.195.sslip.io', // Temp domain
    'https://yourapp.com', // Optional custom domain
    'http://localhost:4200',  // Replace with your frontend URL if different

];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error(`Not allowed by CORS: ${origin}`));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

// ✅ Middleware
app.use(bodyParser.json());

const API_KEY = process.env.API_KEY || "my-secret-api-key"; // fallback if .env missing

app.use((req, res, next) => {
    const clientApiKey = req.headers['x-api-key'];
    if (!clientApiKey || clientApiKey !== API_KEY) {
        return res.status(401).json({ message: "Unauthorized: Invalid API Key" });
    }
    next();
});

// ✅ Routes
const appointmentRoutes = require("./appointment");
app.use("/api/appointment", appointmentRoutes);

// ✅ Base URL Function
const getBaseUrl = () => {
    if (process.env.NODE_ENV === "production") {
        const host = process.env.HOST || "localhost";
        return `https://${host}`;
    }
    return `http://localhost:${PORT}`;
};

// ✅ Start Server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Flooring backend running at ${getBaseUrl()}`);
});
