import { gql } from "@apollo/client";

export const PROMPT_DETAILS_QUERY = gql`
  query Prompt($id: ID!) {
    prompt(id: $id) {
      id
      title
      content
      tags
      imageUrl
      createdAt
      remixCount
      author {
        id
        name
        avatarUrl
      }
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


export const CREATE_FEEDBACK_MUTATION = gql`
  mutation CreateFeedback($promptId: ID!, $comment: String!, $rating: Int!) {
    createFeedback(promptId: $promptId, comment: $comment, rating: $rating) {
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
`;
