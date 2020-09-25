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
Object.defineProperty(exports, "__esModule", { value: true });
const nexus_1 = require("nexus");
const graphql_relay_1 = require("graphql-relay");
nexus_1.schema.interfaceType({
    name: 'Node',
    definition: t => {
        t.id('id', {
            description: 'Relay ID',
            nullable: false,
            // @ts-ignore
            resolve: ({ id }, __, ___, { parentType }) => {
                return graphql_relay_1.toGlobalId(parentType.name, id);
            }
        });
        t.resolveType(node => {
            // @ts-ignore
            return node.type;
        });
    }
});
nexus_1.schema.extendType({
    type: 'Query',
    definition: t => {
        t.field('node', {
            type: 'Node',
            args: { id: nexus_1.schema.idArg({ required: true }) },
            resolve: (_, args, { db }) => __awaiter(void 0, void 0, void 0, function* () {
                const { id, type, prismaObject } = decodeGlobalId(args.id);
                // @ts-ignore
                const model = db[prismaObject];
                const node = yield model.findOne({ where: { id } });
                return Object.assign(Object.assign({}, node), { type });
            })
        });
        t.field('nodes', {
            type: 'Node',
            list: true,
            args: {
                ids: nexus_1.schema.idArg({ list: true, required: true })
            },
            // @ts-ignore
            // TODO wait for fix from nexusjs
            resolve: (_, args, { db }) => {
                return args.ids.map((globalId) => __awaiter(void 0, void 0, void 0, function* () {
                    const { id, type, prismaObject } = decodeGlobalId(globalId);
                    // @ts-ignore
                    const model = db[prismaObject];
                    const node = yield model.findOne({ where: { id } });
                    return Object.assign(Object.assign({}, node), { type });
                }));
            }
        });
    }
});
/*
 * HELPERS
 */
const decodeGlobalId = (globalId) => {
    const { type, id } = graphql_relay_1.fromGlobalId(globalId);
    const prismaObject = type.charAt(0).toLowerCase() + type.slice(1);
    return { id, type, prismaObject };
};
