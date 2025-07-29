import { gql } from "@apollo/client";

export const CREATE_PROMPT_MUTATION = gql`
  mutation CreatePrompt(
    $title: String!
    $content: String!
    $tags: [String!]
    $isPublic: Boolean
    $remixOf: String
    $imageUrl: String
  ) {
    createPrompt(
      title: $title
      content: $content
      tags: $tags
      isPublic: $isPublic
      remixOf: $remixOf
      imageUrl: $imageUrl
    ) {
      id
      title
      content
      tags
      isPublic
      remixOf
      remixCount
      createdAt
      updatedAt
      imageUrl
      author {
        id
        name
        avatarUrl
      }
    }
  }
`;

export const UPDATE_PROMPT_MUTATION = gql`
  mutation UpdatePrompt(
    $id: ID!
    $title: String
    $content: String
    $tags: [String!]
    $isPublic: Boolean
    $imageUrl: String
  ) {
    updatePrompt(
      id: $id
      title: $title
      content: $content
      tags: $tags
      isPublic: $isPublic
      imageUrl: $imageUrl
    ) {
      id
      title
      content
      tags
      isPublic
      remixOf
      remixCount
      createdAt
      updatedAt
      imageUrl
      author {
        id
        name
        avatarUrl
      }
    }
  }
`;

