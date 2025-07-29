import { gql } from 'apollo-server-express';

export const typeDefs = gql`
  scalar DateTime

  type User {
    id: ID!
    email: String!
    name: String
    avatarUrl: String
    googleId: String
    prompts: [Prompt!]!
    feedbacks: [Feedback!]!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Prompt {
    id: ID!
    title: String!
    content: String!
    tags: [String!]!
    isPublic: Boolean!
    author: User!
    remixOf: String
    remixCount: Int!
    feedbacks: [Feedback!]!
    createdAt: DateTime!
    updatedAt: DateTime!
    imageUrl: String
  }

  type Feedback {
    id: ID!
    user: User!
    prompt: Prompt!
    comment: String!
    rating: Int!
    createdAt: DateTime!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Query {
    me: User
    prompt(id: ID!): Prompt
    prompts(
      search: String
      tags: [String!]
      authorId: ID
      isPublic: Boolean
      skip: Int
      take: Int
    ): [Prompt!]!
    feedbacks(promptId: ID!): [Feedback!]!
    users: [User!]!
  }

  type Mutation {
  signup(email: String!, password: String!, name: String, avatarUrl: String): AuthPayload!
  login(email: String!, password: String!): AuthPayload!
  googleAuth(token: String!, avatarUrl: String): AuthPayload!

  updateUserProfile(name: String!, email: String!, avatarUrl: String): User!
  deleteAccount: Boolean!

  createPrompt(
    title: String!
    content: String!
    tags: [String!]
    isPublic: Boolean
    remixOf: String
    imageUrl: String
  ): Prompt!
  updatePrompt(
    id: ID!
    title: String
    content: String
    tags: [String!]
    isPublic: Boolean
    imageUrl: String
  ): Prompt!
  deletePrompt(id: ID!): Boolean!

  createFeedback(promptId: ID!, comment: String!, rating: Int!): Feedback!
  deleteFeedback(id: ID!): Boolean!
}
`;