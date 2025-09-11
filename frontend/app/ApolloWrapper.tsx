"use client";
import {
  ApolloNextAppProvider,
  ApolloClient,
  InMemoryCache,
} from "@apollo/client-integration-nextjs";
import { HttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";

function makeClient() {
  const graphqlEndpoint =
    process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT ||
    "https://promptstack.siddharthp.me/graphql";

  // 👇 Add a console.log here
  console.log("🚀 GraphQL Endpoint:", graphqlEndpoint);

  const httpLink = new HttpLink({
    uri: graphqlEndpoint,
  });

  // Add authLink here
  const authLink = setContext((_, { headers }) => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    return {
      headers: {
        ...headers,
        authorization: token ? `Bearer ${token}` : "",
      },
    };
  });

  return new ApolloClient({
    cache: new InMemoryCache(),
    link: authLink.concat(httpLink),
  });
}

export function ApolloWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ApolloNextAppProvider makeClient={makeClient}>
      {children}
    </ApolloNextAppProvider>
  );
}
