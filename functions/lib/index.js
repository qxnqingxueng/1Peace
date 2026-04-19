"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMalaysiaNews = exports.runPolicyBrainFlow = void 0;
const https_1 = require("firebase-functions/v2/https");
const app_1 = require("firebase-admin/app");
const policyBrainFlow_js_1 = require("./flows/policyBrainFlow.js");
const fetchMalaysiaNews_js_1 = require("./news/fetchMalaysiaNews.js");
(0, app_1.initializeApp)();
exports.runPolicyBrainFlow = (0, https_1.onCall)({
    cors: true,
    region: process.env.FUNCTIONS_REGION || 'asia-southeast1',
}, async (request) => {
    const payload = request.data;
    return (0, policyBrainFlow_js_1.policyBrainFlow)(payload);
});
exports.getMalaysiaNews = (0, https_1.onCall)({
    cors: true,
    region: process.env.FUNCTIONS_REGION || 'asia-southeast1',
    timeoutSeconds: 30,
}, async () => (0, fetchMalaysiaNews_js_1.fetchMalaysiaNews)());
