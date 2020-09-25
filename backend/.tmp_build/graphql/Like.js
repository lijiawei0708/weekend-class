"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const nexus_1 = require("nexus");
nexus_1.schema.objectType({
    name: 'Like',
    definition: t => {
        t.implements('Node');
        //t.model.id()
        t.model.post();
        t.model.user();
    }
});
