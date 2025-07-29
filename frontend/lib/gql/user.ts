import { gql } from "@apollo/client";

export const ME_QUERY = gql`
  query MeWithPrompts {
    me {
      id
      name
      avatarUrl
}
}`;