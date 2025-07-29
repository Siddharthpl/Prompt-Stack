import { gql } from "@apollo/client";

export const ME_WITH_PROMPTS_AND_FEEDBACK_QUERY = gql`
  query MeWithPromptsAndFeedback {
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

export const UPDATE_USER_PROFILE_MUTATION = gql`
  mutation UpdateUserProfile($name: String!, $email: String!, $avatarUrl: String) {
    updateUserProfile(name: $name, email: $email, avatarUrl: $avatarUrl) {
      id
      name
      email
      avatarUrl
      updatedAt
    }
  }
`;

export const DELETE_PROMPT_MUTATION = gql`
  mutation DeletePrompt($id: ID!) {
    deletePrompt(id: $id)
  }
`;

export const DELETE_ACCOUNT_MUTATION = gql`
  mutation DeleteAccount {
    deleteAccount
  }
`;