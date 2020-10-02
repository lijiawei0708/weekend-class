import React from 'react'
import { Story, Meta } from '@storybook/react/types-6-0'

import Post, {PostProps} from '.'

export default {
  title: 'Post',
  component: Post,
} as Meta

const Template: Story<PostProps> = (args) => {
  return <Post {...args} /> 
}