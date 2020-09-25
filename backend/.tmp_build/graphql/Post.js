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
const graphql_relay_1 = require("graphql-relay");
nexus_1.schema.objectType({
    name: 'Post',
    definition: t => {
        t.implements('Node');
        // t.model.id()
        t.model.content();
        t.model.likes();
        t.model.author();
        t.model.createdAt();
    }
});
nexus_1.schema.extendType({
    type: 'User',
    definition: t => {
        //t.model.posts()
        t.connection('posts', {
            type: 'Post',
            // @ts-ignore
            resolve: (user, args, ctx) => __awaiter(void 0, void 0, void 0, function* () {
                const postsByUser = yield ctx.db.user.findOne({ where: { id: user.id } }).posts();
                const connection = graphql_relay_1.connectionFromArray(postsByUser, args);
                return connection;
            }),
            extendConnection: t => {
                t.int('totalCount', {
                    resolve: (postConnection, _args, _ctx) => {
                        return 10;
                    }
                });
            }
        });
    }
});
// POSTS QUERY
nexus_1.schema.inputObjectType({
    name: 'PostConnectWhereInput',
    definition: t => {
        t.string('keyword');
        t.string('author_email');
    }
});
nexus_1.schema.extendType({
    type: 'Query',
    definition: t => {
        t.connection('posts', {
            type: 'Post',
            additionalArgs: {
                where: 'PostConnectWhereInput'
            },
            resolve: (_root, _a, ctx) => {
                var _b, _c;
                var { where } = _a, args = __rest(_a, ["where"]);
                return graphql_relay_1.connectionFromPromisedArray(ctx.db.post.findMany({
                    where: {
                        content: {
                            contains: (_b = where === null || where === void 0 ? void 0 : where.keyword) !== null && _b !== void 0 ? _b : undefined
                        },
                        author: {
                            email: (_c = where === null || where === void 0 ? void 0 : where.author_email) !== null && _c !== void 0 ? _c : undefined
                        },
                    }
                }), args);
            }
        });
    }
});
nexus_1.schema.extendType({
    type: 'Query',
    definition: t => {
        t.connection('posts', {
            type: 'Post',
            resolve: (_root, args, ctx) => __awaiter(void 0, void 0, void 0, function* () {
                //const postConnection = connectionFromArray(posts, args)
                return graphql_relay_1.connectionFromPromisedArray(ctx.db.post.findMany({}), args);
            })
        });
    }
});
// CREATE POST MUTATION
nexus_1.schema.inputObjectType({
    name: 'CreatePostInput',
    definition: t => {
        t.string('content', { required: true });
    }
});
nexus_1.schema.objectType({
    name: 'CreatePostPayload',
    definition: t => {
        t.field('post', { type: 'Post' });
    }
});
nexus_1.schema.extendType({
    type: 'Mutation',
    definition: t => {
        t.field('createPost', {
            type: 'CreatePostPayload',
            args: {
                input: nexus_1.schema.arg({
                    type: 'CreatePostInput',
                    required: true,
                })
            },
            resolve: (_root, { input }, ctx) => __awaiter(void 0, void 0, void 0, function* () {
                const userId = ctx.getUserId();
                if (!userId)
                    throw new Error('Unauthorized');
                const post = yield ctx.db.post.create({
                    data: {
                        content: input.content,
                        author: {
                            connect: {
                                id: userId
                            }
                        }
                    }
                });
                return {
                    post
                };
            })
        });
    }
});
// DELETE POST MUTATION
nexus_1.schema.inputObjectType({
    name: 'DeletePostInput',
    definition: t => {
        t.id('id', { required: true });
    }
});
nexus_1.schema.objectType({
    name: 'DeletePostPayload',
    definition: t => {
        t.field('post', { type: 'Post' });
    }
});
nexus_1.schema.extendType({
    type: 'Mutation',
    definition: t => {
        t.field('deletePost', {
            type: 'DeletePostPayload',
            args: {
                input: nexus_1.schema.arg({
                    type: 'DeletePostInput',
                    required: true
                })
            },
            resolve: (_root, args, ctx) => __awaiter(void 0, void 0, void 0, function* () {
                // check if user is authorized
                const userId = ctx.getUserId();
                if (!userId)
                    throw new Error('Unauthorized');
                // check if the post is existed
                const { id: postId } = graphql_relay_1.fromGlobalId(args.input.id);
                const post = yield ctx.db.post.findOne({
                    where: {
                        id: postId
                    }
                });
                const isPostExisted = Boolean(post);
                if (!isPostExisted) {
                    throw new Error('This post is not existed');
                }
                // check if the post is belong to current user
                const postsByUser = yield ctx.db
                    .user.findOne({ where: { id: userId } })
                    .posts({ where: {
                        id: postId
                    } });
                if (postsByUser.length === 0)
                    throw new Error('This post is not belong to this user');
                // delete and return it
                const deletedPost = yield ctx.db.post.delete({
                    where: {
                        id: postId
                    }
                });
                return {
                    post: deletedPost
                };
            })
        });
    }
});
// LIKE POST MUTATION
//identify the input of this mutation
nexus_1.schema.inputObjectType({
    name: 'LikePostInput',
    definition: t => {
        t.id('postId', { required: true });
    }
});
//this is for identify mutation field
nexus_1.schema.objectType({
    name: 'LikePostPayload',
    definition: t => {
        t.field('like', { type: 'Like' });
    }
});
// like mutation
nexus_1.schema.extendType({
    type: 'Mutation',
    definition: t => {
        t.field('likePost', {
            type: 'LikePostPayload',
            args: {
                input: nexus_1.schema.arg({
                    type: 'LikePostInput',
                    required: true,
                })
            },
            resolve: (_root, args, ctx) => __awaiter(void 0, void 0, void 0, function* () {
                //check if the user is authorized 
                const userId = ctx.getUserId();
                if (!userId)
                    throw new Error('Unauthorized');
                //check if the user has already like the post
                const { id: postId } = graphql_relay_1.fromGlobalId(args.input.postId);
                const userAlreadyLiked = yield ctx.db.like.findMany({
                    where: {
                        userId,
                        postId,
                    }
                });
                //if has liked 
                if (userAlreadyLiked.length > 0) {
                    throw new Error('you have already liked this post');
                }
                const like = ctx.db.like.create({
                    data: {
                        user: { connect: { id: userId } },
                        post: { connect: { id: postId } },
                    }
                });
                return {
                    like
                };
            })
        });
    }
});
//unlike the post mutation
nexus_1.schema.inputObjectType({
    name: 'UnlikePostInput',
    definition: t => {
        t.id('postId', { required: true });
    }
});
nexus_1.schema.objectType({
    name: 'UnlikePostPayload',
    definition: t => {
        t.field('like', { type: 'Like' });
    }
});
nexus_1.schema.extendType({
    type: 'Mutation',
    definition: t => {
        t.field('unlikePost', {
            type: 'UnlikePostPayload',
            args: {
                input: nexus_1.schema.arg({
                    type: 'UnlikePostInput',
                    required: true,
                })
            },
            resolve: (_root, args, ctx) => __awaiter(void 0, void 0, void 0, function* () {
                const { id: postId } = graphql_relay_1.fromGlobalId(args.input.postId);
                //check if the user is authorized 
                const userId = ctx.getUserId();
                if (!userId)
                    throw new Error('Unauthorized');
                //check have already liked
                const postLiked = yield ctx.db.like.findMany({
                    where: {
                        postId,
                        userId
                    }
                });
                if (postLiked.length === 0) {
                    throw new Error('there is no like');
                }
                const deleteLike = yield ctx.db.like.deleteMany({
                    where: {
                        userId: userId,
                        postId: postId
                    }
                });
                const likeNum = yield ctx.db.like.count({
                    where: {
                        postId: postId
                    }
                });
                const updatePostLikeNum = yield ctx.db.post.update({
                    where: {
                        id: args.input.postId
                    },
                    data: {
                    //like: likeNum - 1
                    }
                });
                return {
                    like: updatePostLikeNum
                };
            })
        });
    }
});
