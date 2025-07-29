import { gql } from "@apollo/client";

export const PROMPTS_QUERY = gql`
  query Prompts($search: String, $tags: [String!], $isPublic: Boolean) {
    prompts(search: $search, tags: $tags, isPublic: $isPublic) {
      id
      title
      content
      tags
      isPublic
      author {
        id
        name
        avatarUrl
      }
      remixOf
      remixCount
      createdAt
      updatedAt
      imageUrl
      feedbacks {
        id
        comment
        rating
        createdAt
        user {
          id
          name
          avatarUrl
        }
      }
    }
  }
`;