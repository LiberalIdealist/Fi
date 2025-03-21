"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var firebase_admin_1 = require("firebase-admin");
var dotenv_1 = require("dotenv");
var fs_1 = require("fs");
dotenv_1.default.config();
function diagnoseFirebase() {
    return __awaiter(this, void 0, void 0, function () {
        var serviceAccount, decodedJson, authError_1, db, collections, docRef, firestoreError_1, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 13, , 14]);
                    // Log environment variables (sanitized)
                    console.log("Environment variables check:");
                    console.log("- FIREBASE_PROJECT_ID: ".concat(process.env.FIREBASE_PROJECT_ID || 'MISSING'));
                    console.log("- FIREBASE_CLIENT_EMAIL: ".concat(process.env.FIREBASE_CLIENT_EMAIL ? 'PRESENT' : 'MISSING'));
                    console.log("- FIREBASE_PRIVATE_KEY: ".concat(process.env.FIREBASE_PRIVATE_KEY ? 'PRESENT' : 'MISSING'));
                    console.log("- FIREBASE_PRIVATE_KEY_BASE64: ".concat(process.env.FIREBASE_PRIVATE_KEY_BASE64 ? 'PRESENT' : 'MISSING'));
                    serviceAccount = void 0;
                    if (process.env.FIREBASE_PRIVATE_KEY_BASE64) {
                        decodedJson = Buffer.from(process.env.FIREBASE_PRIVATE_KEY_BASE64, 'base64').toString('utf8');
                        try {
                            serviceAccount = JSON.parse(decodedJson);
                            console.log("\nService account loaded from base64:");
                            console.log("- Project ID: ".concat(serviceAccount.project_id));
                            console.log("- Client Email: ".concat(serviceAccount.client_email));
                            // Save decoded service account for inspection
                            fs_1.default.writeFileSync('decoded-service-account.json', decodedJson);
                            console.log("- Decoded service account saved to decoded-service-account.json");
                        }
                        catch (parseError) {
                            console.error("Failed to parse base64 service account:", parseError);
                        }
                    }
                    else if (process.env.FIREBASE_PRIVATE_KEY) {
                        serviceAccount = {
                            type: "service_account",
                            project_id: process.env.FIREBASE_PROJECT_ID || '',
                            private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
                            client_email: process.env.FIREBASE_CLIENT_EMAIL || '',
                            client_id: process.env.FIREBASE_CLIENT_ID
                        };
                        console.log("\nService account constructed from env vars:");
                        console.log("- Project ID: ".concat(serviceAccount.project_id));
                        console.log("- Client Email: ".concat(serviceAccount.client_email));
                    }
                    else {
                        console.error("No service account credentials found!");
                        return [2 /*return*/];
                    }
                    // Initialize Firebase Admin
                    console.log("\nInitializing Firebase Admin...");
                    if (!(firebase_admin_1.default.apps.length > 0)) return [3 /*break*/, 2];
                    console.log("Firebase already initialized, deleting app...");
                    return [4 /*yield*/, firebase_admin_1.default.app().delete()];
                case 1:
                    _a.sent();
                    _a.label = 2;
                case 2:
                    firebase_admin_1.default.initializeApp({
                        credential: firebase_admin_1.default.credential.cert(serviceAccount)
                    });
                    console.log("Firebase Admin initialized successfully.");
                    // Test Auth
                    console.log("\nTesting Firebase Authentication...");
                    _a.label = 3;
                case 3:
                    _a.trys.push([3, 5, , 6]);
                    return [4 /*yield*/, firebase_admin_1.default.auth().listUsers(1)];
                case 4:
                    _a.sent();
                    console.log("✅ Authentication working!");
                    return [3 /*break*/, 6];
                case 5:
                    authError_1 = _a.sent();
                    console.error("❌ Authentication error:", authError_1);
                    return [3 /*break*/, 6];
                case 6:
                    // Test Firestore
                    console.log("\nTesting Firestore...");
                    _a.label = 7;
                case 7:
                    _a.trys.push([7, 11, , 12]);
                    // First test - list collections
                    console.log("- Trying to list collections...");
                    db = firebase_admin_1.default.firestore();
                    return [4 /*yield*/, db.listCollections()];
                case 8:
                    collections = _a.sent();
                    console.log("\u2705 Found ".concat(collections.length, " collections"));
                    // Second test - write/read a document
                    console.log("- Trying to write a test document...");
                    return [4 /*yield*/, db.collection('test').doc('diagnostic').set({
                            timestamp: firebase_admin_1.default.firestore.FieldValue.serverTimestamp(),
                            test: "Firestore diagnostic test"
                        })];
                case 9:
                    _a.sent();
                    console.log("- Trying to read the test document...");
                    return [4 /*yield*/, db.collection('test').doc('diagnostic').get()];
                case 10:
                    docRef = _a.sent();
                    if (docRef.exists) {
                        console.log("✅ Successfully read document:", docRef.data());
                    }
                    else {
                        console.log("❌ Document not found!");
                    }
                    console.log("Firestore tests completed.");
                    return [3 /*break*/, 12];
                case 11:
                    firestoreError_1 = _a.sent();
                    console.error("❌ Firestore error:", firestoreError_1);
                    if (firestoreError_1 && typeof firestoreError_1 === 'object' && 'code' in firestoreError_1) {
                        console.error("Error code:", firestoreError_1.code);
                        if ('details' in firestoreError_1) {
                            console.error("Error details:", firestoreError_1.details);
                        }
                    }
                    return [3 /*break*/, 12];
                case 12: return [3 /*break*/, 14];
                case 13:
                    error_1 = _a.sent();
                    console.error("Diagnostic error:", error_1);
                    return [3 /*break*/, 14];
                case 14: return [2 /*return*/];
            }
        });
    });
}
diagnoseFirebase().then(function () { return console.log("Diagnosis complete."); });
