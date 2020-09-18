import { schema, use } from "nexus";
import { connectionFromPromisedArray, connectionFromArray, fromGlobalId } from "graphql-relay";
import { arg } from "nexus/components/schema";

schema.objectType({
  name: 'Post',
  definition: t => {
    t.implements('Node')
    // t.model.id()
    t.model.content()
    t.model.like()
    t.model.author()
    t.model.createdAt()
  }
})

schema.extendType({
  type: 'User',
  definition: t => {
    //t.model.posts()
    t.connection('posts', {
      type: 'Post',
      // @ts-ignore
      resolve: async (user, args, ctx) => {
        const postsByUser = await ctx.db.user.findOne({ where : {id: user.id}}).posts()
        const connection = connectionFromArray(postsByUser, args)

        return connection
      }
    })
  }
})

// POSTS QUERY
schema.inputObjectType({
  name: 'PostConnectWhereInput',
  definition: t => {
    t.string('keyword')
    t.string('author_email')
  }
})
schema.extendType({
  type: 'Query',
  definition: t => {
    t.connection('posts', {
      type: 'Post',
      additionalArgs: {
        where: 'PostConnectWhereInput'
      },
      resolve: (_root, { where, ...args }, ctx) => {
        return connectionFromPromisedArray(
          ctx.db.post.findMany({
            where: {
              content: {
                contains: where?.keyword ?? undefined
              },
              author: {
                email: where?.author_email ?? undefined
              },
            }
          }),
          args
        )
      }
    })
  }
})

schema.extendType({
  type: 'Query',
  definition: t => {
    t.connection('posts', {
      type: 'Post', 
      resolve: async (_root, args, ctx) => {
        //const postConnection = connectionFromArray(posts, args)
        return connectionFromPromisedArray(
          ctx.db.post.findMany({}), 
          args
          )
      }
    }
    )
  }
})

// CREATE POST MUTATION
schema.inputObjectType({
  name: 'CreatePostInput',
  definition: t => {
    t.string('content', { required: true })
  }
})
schema.objectType({
  name: 'CreatePostPayload',
  definition: t => {
    t.field('post', { type: 'Post' })
  }
})
schema.extendType({
  type: 'Mutation',
  definition: t => {
    t.field('createPost', {
      type: 'CreatePostPayload',
      args: {
        input: schema.arg({
          type: 'CreatePostInput',
          required: true,
        })
      },
      resolve: async (_root, { input }, ctx) => {
        const userId = ctx.getUserId()
        if (!userId) throw new Error('Unauthorized')

        const post = await ctx.db.post.create({
          data: {
            content: input.content,
            author: {
              connect: {
                id: userId
              }
            }
          }
        })

        return {
          post
        }
      }
    })
  }
})

// DELETE POST MUTATION
schema.inputObjectType({
  name: 'DeletePostInput',
  definition: t => {
    t.id('id', {required: true})
  }
})
schema.objectType({
  name: 'DeletePostPayload',
  definition: t => {
    t.field('post', { type: 'Post' })
  }
})
schema.extendType({
  type: 'Mutation', 
  definition: t => {
    t.field('deletePost', {
      type: 'DeletePostPayload',
      args: { 
        input: schema.arg({
          type: 'DeletePostInput',
          required: true
        })
      },
      resolve: async (_root, args, ctx) => {
        // check if user is authorized
        const userId = ctx.getUserId()
        if(!userId) throw new Error('Unauthorized')

        // check if the post is existed
        const { id: postId } = fromGlobalId(args.input.id)
        const post = await ctx.db.post.findOne({
          where: {
            id: postId
          }
        })
        const isPostExisted = Boolean(post)
        if(!isPostExisted) {
          throw new Error('This post is not existed')
        }
        // check if the post is belong to current user
        const postsByUser = await ctx.db
          .user.findOne({ where: { id: userId }})
          .posts({ where: {
            id: postId
          }})
        if(postsByUser.length === 0) throw new Error('This post is not belong to this user')

        // delete and return it
        const deletedPost = await ctx.db.post.delete({
          where: {
            id: postId
          }
        })
        return {
          post: deletedPost
        }
      }
    })
  }
})

// LIKE POST MUTATION

//identify the input of this mutation
schema.inputObjectType({
  name: 'LikePostInput',
  definition: t => {
    t.id('postId', {required: true})
  }
})

//this is for identify mutation field
schema.objectType({
  name: 'LikePostPayload',
  definition: t => {
    t.field('post', { type: 'Post' }),
    t.field('like', { type: 'Like' })
  }
})

// like mutation
schema.extendType({
  type: 'Mutation',
  definition: t => {
    t.field('likePost', {
      type: 'LikePostPayload', 
      args: {
        input: schema.arg({
          type: 'LikePostInput',
          required: true,
        })
      },
      resolve: async(_root, args, ctx) => {

        //check if the user is authorized 
        const userId = ctx.getUserId()
        if(!userId) throw new Error('Unauthorized')

        //check if the user has already like the post
        const { id: postId } = fromGlobalId(args.input.postId)

        const userAlreadyLiked = await ctx.db.like.findMany({
          where: {
            userId,
            postId,
          }
        })

        //if has liked 
        if(userAlreadyLiked.length > 0){
          throw new Error('you have already liked this post') 
        }
        //like the post
        const likeThePost = await ctx.db.like.create({
          data: {
            user: {
              connect: {
                id: userId
              }
            },
            post: {
              connect: {
                id: postId
              }
            }
          }
        })

        const findNumberOfLikedPost = await ctx.db.like.count({
          where: {
            postId: args.input.postId,
            userId: userId
          }
        })

        //console.log(findNumberOfLikedPost)

        //update post.like + 1 
        const likeNumberPlus = await ctx.db.post.update({
          where: {
            id: postId
          },
          data: {
            like: findNumberOfLikedPost + 1
          }
        })

        const findPost = await ctx.db.post.findOne({
          where: {
            id: postId
          }
        })

        return {
          like: likeThePost,
          post: findPost
        }
      }
    })
  }
})


//unlike the post mutation

schema.inputObjectType({
  name: 'UnlikePostInput',
  definition: t => {
    t.id('postId', {required: true})
  }
})
schema.objectType({
  name: 'UnlikePostPayload',
  definition: t => {
    t.field('like', { type: 'Like'})
  }
})

schema.extendType({
  type: 'Mutation',
  definition: t => {
    t.field('unlikePost', {
      type: 'UnlikePostPayload',
      args: {
        input: schema.arg({
          type: 'UnlikePostInput',
          required: true,
        })
      },
      resolve: async(_root, args, ctx) => {

        const {id: postId} = fromGlobalId(args.input.postId)
        //check if the user is authorized 
        const userId = ctx.getUserId()
        if(!userId) throw new Error('Unauthorized')

        //check have already liked
        const postLiked = await ctx.db.like.findMany({
          where: {
            postId,
            userId
          }
        })

        if(postLiked.length ===0){
          throw new Error ('there is no like')
        }

        const deleteLike = await ctx.db.like.deleteMany({
          where: {
            userId: userId,
            postId: postId
          }
        })

        const likeNum = await ctx.db.post.findOne({
          where: {
            id: postId
          }
        })

        // const updatePostLikeNum = await ctx.db.post.update({
        //   where: {
        //     id: args.input.postId
        //   },
        //   data: {
        //     like = likeNum?.like - 1
        //   }
        // })

      }
    })
  }
})
