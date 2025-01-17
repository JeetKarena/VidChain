import express from "express";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import connectDB from "./config/db";
import typeDefs from "./graphql/schema/typeDefs";
import resolvers from "./graphql/resolvers";
import UserService from "./services/user";

const startServer = async () => {
  await connectDB();

  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  await server.start();

  const app = express();
  const PORT = Number(process.env.PORT) || 8000;

  app.use(express.json());

  app.get("/", (req, res) => {
    res.json({ message: "Server is up and running" });
  });

  app.use(
    "/graphql",
    expressMiddleware(server, {
      context: async ({ req }) => {
        const token = req.headers["token"] as string;

        try {
          const user = UserService.decodeJWTToken(token);
          return { user, pubsub: null };
        } catch (error) {
          return { pubsub: null };
        }
      },
    })
  );

  app.listen(PORT, () => console.log(`Server started at PORT:${PORT}`));
};

startServer();
