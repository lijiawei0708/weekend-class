"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserId = void 0;
const jsonwebtoken_1 = require("jsonwebtoken");
const APP_SECRET = process.env.APP_SECRET || '';
function getUserId(req) {
    const Authorization = req.get('Authorization');
    if (Authorization) {
        const token = Authorization.replace('Bearer ', '');
        const verifiedToken = jsonwebtoken_1.verify(token, APP_SECRET);
        return verifiedToken && verifiedToken.userId;
    }
}
exports.getUserId = getUserId;
