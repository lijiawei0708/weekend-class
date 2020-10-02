import React from 'react';

import {Card, } from '@material-ui/core'

export type PostProps = {
  authorName: string
  createdAt: string
  content: string
}

const Post: React.FC<PostProps> = ({authorName, createdAt, content}) => {
  return (
    <div></div>
  )
}

export default Post