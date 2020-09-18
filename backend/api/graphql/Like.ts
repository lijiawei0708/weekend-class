import { schema } from 'nexus';

schema.objectType({
  name: 'Like',
  definition: t => {
    t.implements('Node')
    //t.model.id()
    t.model.postId()
    t.model.post()
    t.model.user()
    t.model.userId()
  }
})