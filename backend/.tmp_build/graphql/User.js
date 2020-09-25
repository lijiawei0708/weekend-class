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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
const nexus_1 = require("nexus");
const bcryptjs_1 = require("bcryptjs");
const jsonwebtoken_1 = require("jsonwebtoken");
const { APP_SECRET = '' } = process.env;
nexus_1.schema.objectType({
    name: 'User',
    definition: t => {
        t.implements('Node');
        // t.model.id()
        t.model.email();
        t.model.name();
        t.model.avatar();
    }
});
// AUTH PAYLOAD
nexus_1.schema.objectType({
    name: 'AuthPayload',
    definition: t => {
        t.string('token');
        t.field('user', { type: 'User' });
        t.field('like', { type: 'Like' });
    }
});
// SIGNUP MUTATION
nexus_1.schema.inputObjectType({
    name: 'SignupInput',
    definition: t => {
        t.string('email', { required: true });
        t.string('password', { required: true });
        t.string('name', { required: true });
        t.string('avatar');
    }
});
nexus_1.schema.extendType({
    type: 'Mutation',
    definition: t => {
        t.field('signup', {
            type: 'AuthPayload',
            args: {
                input: nexus_1.schema.arg({ type: 'SignupInput', required: true })
            },
            resolve: (_root, _a, ctx) => { var _b, password, input; return __awaiter(void 0, void 0, void 0, function* () {
                _b = _a.input, { password } = _b, input = __rest(_b, ["password"]);
                const isEmailExisted = yield ctx.db.user.findOne({ where: { email: input.email } });
                if (isEmailExisted)
                    throw new Error('Email is existed');
                const hashedPassword = yield bcryptjs_1.hash(password, 10);
                const user = yield ctx.db.user.create({
                    data: Object.assign(Object.assign({}, input), { password: hashedPassword })
                });
                const like = yield ctx.db.like.findMany();
                const token = jsonwebtoken_1.sign({ userId: user.id }, APP_SECRET);
                return {
                    token,
                    user,
                    like
                };
            }); }
        });
    }
});
// LOGIN MUTATION
nexus_1.schema.inputObjectType({
    name: 'LoginInput',
    definition: t => {
        t.string('email', { required: true });
        t.string('password', { required: true });
    }
});
nexus_1.schema.extendType({
    type: 'Mutation',
    definition: t => {
        t.field('login', {
            type: 'AuthPayload',
            args: {
                input: nexus_1.schema.arg({ type: 'LoginInput', required: true })
            },
            // @ts-ignore
            resolve: (_root, { input: { email, password } }, ctx) => __awaiter(void 0, void 0, void 0, function* () {
                const user = yield ctx.db.user.findOne({ where: { email } });
                const like = yield ctx.db.like.findMany();
                console.log(like);
                if (!user)
                    throw new Error(`No user found for email: ${email}`);
                const isPasswordValid = yield bcryptjs_1.compare(password, user.password);
                if (!isPasswordValid)
                    return new Error('Invalid password');
                const token = jsonwebtoken_1.sign({ userId: user.id }, APP_SECRET);
                return {
                    token,
                    user,
                    like
                };
            })
        });
    }
});
