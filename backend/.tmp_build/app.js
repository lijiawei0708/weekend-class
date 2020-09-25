"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const nexus_1 = require("nexus");
const nexus_plugin_prisma_1 = require("nexus-plugin-prisma");
nexus_1.use(nexus_plugin_prisma_1.prisma({
    features: {
        crud: true,
    },
    migrations: true,
}));
const utils_1 = require("./utils");
nexus_1.schema.addToContext(({ req }) => {
    return {
        getUserId: () => utils_1.getUserId(req)
    };
});
