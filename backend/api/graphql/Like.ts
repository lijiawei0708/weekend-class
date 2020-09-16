import { schema } from 'nexus';

schema.objectType({
  name: 'Like',
  definition: t => {
    t.implements('Node')
    // t.model.id()
    t.model.post()
    t.model.postId()
    t.model.user()
    t.model.userId()
  }
})