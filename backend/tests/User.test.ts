import { createTestContext } from './__helpers'

const ctx = createTestContext()

describe('User', () => {
  test('signup successfully mutation', async () => {
    const signupPayload = await signupMutation(ctx, {
      email: 'lijiawei0708@gmail.com',
      password: 'lijiawei0708',
      name: 'Chris'
    })

    expect(signupPayload).toHaveProperty('signup')
    expect(signupPayload.signup).toHaveProperty('token')
    expect(signupPayload.signup).toHaveProperty('user')
  })

    // sign up a user
  test('signup email existed error', async () => {
    const signupAginPayload = await signupMutation(ctx, {
      email: 'lijiawei0708@gmail.com',
      password: '123123123',
      name: 'Test with same email'
    }).catch((err: any) => {
      expect(err)
    })

    console.log(signupAginPayload)
    expect(signupAginPayload)
  })

  // signup
  // check payload {token, user}

  test('Check payload error', async () => {
    const signupPayload = await ctx.client.send(
      `
        mutation($input: SignupInput!){
          signup(input: $input) {
            token
            user{
              id
            }
          }
        }
      `,
      {
        input: {
          email: '1111111111@gmail.com',
          password: '123123123',
          name: 'payload test'
        }
      }
    )
    console.log(signupPayload)
    expect(signupPayload).toHaveProperty('signup')
  })
  // signup again with same credentials
  // check error

  test('Check signup again with same credentials', async () => {
    const payload = await ctx.client.send(
      `
        mutation($input: SignupInput!){
          signup(input: $input) {
            token
            user{
              id
            }
          }
        }
      `,
      {
        input: {
          email: '1111111111@gmail.com',
          password: '123123123',
          name: 'test sign up twice'
        }
      }
    ).catch((err: any) => {
      expect(err)
    })

  })

  //login the user 
    //check input
    //check payload 
  
    test('login', async () => {
      const payload = await ctx.client.send(
        `
          mutation($input: LoginInput!){
            login(input: $input){
              token
              user{
                id
              }
            }
          }
        `,
        {
          input: {
            email: 'lijiawei0708@gmail.com',
            password: 'lijiawei0708'
          }
        }
      )
      console.log(payload)
      expect(payload).toHaveProperty('login')
      expect(payload.login).toHaveProperty('token')
      expect(payload.login).toHaveProperty('user')
    })

  //node(id: ID!) to get the user, ...
    //check payload 
  
  test('checkGetUserFromNode', async () => {
    const payload = await ctx.client.send(
      `
        query($id: ID!)
        node(id: $id){
          ...on User{
            id 
            email
            name
          }
        }
      `,
      {
        id: 'VXNlcjpja2ZndWphNW8wMDAxN2h1eDA4djVnM2w3'
      }
    )
    expect(payload).toHaveProperty('node')
    expect(payload.node).toHaveProperty('id')
    expect(payload.node).toHaveProperty('email')
    expect(payload.node).toHaveProperty('name')
  })

  
  const signupMutation = (ctx: any, input: any) => {
    return ctx.client.send(
      `
        mutation($input: SignupInput!){
          signup(input: $input) {
            token
            user{
              id
            }
          }
        }
      `,
      { input }
    )
  }
})