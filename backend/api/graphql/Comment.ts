import { connectionFromArray, fromGlobalId } from 'graphql-relay';
import { schema } from 'nexus';

schema.objectType({
  name: 'Comment',
  definition: t => {
    t.implements('Node')
    //t.model.id()
    t.model.post()
    t.model.postId()
    t.model.author()
    t.model.userId()
    t.model.content()
    t.model.createdAt()
  }
})

schema.extendType({
  type: 'Post',
  definition: t => {
    t.connection('comments',{
      type: 'Comment',
      resolve: async (post, args, ctx) => {
        const commentByPost = await ctx.db.post.findOne({
          where: {
            id: post.id
          }
        }).comments()
        const connection = connectionFromArray(commentByPost, args)
        
        return connection
      }
    })
  }
})

//create comments 
schema.inputObjectType({
  name: 'CreateCommentInput',
  definition: t => {
    t.id('postId', {required: true})
    t.string('content', {required:true})
  }
})

schema.objectType({
  name: 'CreateCommentPayload',
  definition: t => {
    t.field('comment', { type: 'Comment' })
  }
})

schema.extendType({
  type: 'Mutation',
  definition: t => {
    t.field('createComment', {
      type: 'CreateCommentPayload',
      args: {
        input: schema.arg({
          type: 'CreateCommentInput',
          required: true
        })
      },
      resolve: async(root, { input }, ctx) => {
        const userId = ctx.getUserId()
        const { id: postId } = fromGlobalId(input.postId)
        const post = await ctx.db.post.findOne({
          where: {
            id: postId
          }
        })
        if(!post) throw new Error('no post found!')
        const comment = await ctx.db.comment.create({
          data: {
            content: input.content,
            author: {
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
        return {
          comment
        }
      }
    })
  }
})