import { gql } from "@apollo/client";

export const ME_WITH_PROMPTS_QUERY = gql`
  query MeWithPrompts {
    me {
      id
      email
      name
      avatarUrl
      googleId
      createdAt
      updatedAt
      prompts {
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
  }
`;