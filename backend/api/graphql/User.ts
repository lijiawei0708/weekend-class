import { schema } from 'nexus'
import { compare, hash } from 'bcryptjs'
import { sign } from 'jsonwebtoken'

const { APP_SECRET = '' } = process.env

schema.objectType({
  name: 'User',
  definition: t => {
    t.implements('Node')
    // t.model.id()
    t.model.email()
    t.model.name()
    t.model.avatar()
  }
})

// AUTH PAYLOAD
schema.objectType({
  name: 'AuthPayload',
  definition: t => {
    t.string('token')
    t.field('user', { type: 'User' })
    t.field('like', { type: 'Like' })
  }
})

// SIGNUP MUTATION
schema.inputObjectType({
  name: 'SignupInput',
  definition: t => {
    t.string('email', { required: true })
    t.string('password', { required: true })
    t.string('name', { required: true })
    t.string('avatar')
  }
})
schema.extendType({
  type: 'Mutation',
  definition: t => {
    t.field('signup', {
      type: 'AuthPayload',
      args: {
        input: schema.arg({ type: 'SignupInput', required: true })
      },
      resolve: async (_root, { input: { password, ...input }}, ctx) => {
        const isEmailExisted = await ctx.db.user.findOne({ where: { email: input.email }})
        if (isEmailExisted) throw new Error('Email is existed')

        const hashedPassword = await hash(password, 10)
        const user = await ctx.db.user.create({
          data: {
            ...input,
            password: hashedPassword,
          }
        })

        const like = await ctx.db.like.findMany()

        const token = sign({ userId: user.id }, APP_SECRET)
        return {
          token,
          user,
          like
        }
      }
    })
  }
})

// LOGIN MUTATION
schema.inputObjectType({
  name: 'LoginInput',
  definition: t => {
    t.string('email', { required: true })
    t.string('password', { required: true })
  }
})
schema.extendType({
  type: 'Mutation',
  definition: t => {
    t.field('login', {
      type: 'AuthPayload',
      args: {
        input: schema.arg({ type: 'LoginInput', required: true })
      },
      // @ts-ignore
      resolve: async (_root, { input: { email, password }}, ctx) => {
        const user = await ctx.db.user.findOne({ where: { email }})

        const like = await ctx.db.like.findMany()
        console.log(like)
        if (!user) throw new Error(`No user found for email: ${email}`)

        const isPasswordValid = await compare(password, user.password)
        if(!isPasswordValid) return new Error('Invalid password')

        const token = sign({ userId: user.id }, APP_SECRET)
        return {
          token,
          user,
          like
        }
      }
    })
  }
})