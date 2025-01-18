import { transformedSpanSchema } from "@avocet/core";
import { IResolvers } from "mercurius";
import { GraphQLScalarType } from "graphql";

const scalarResolvers: IResolvers = {
  TransformedSpanAttributes: new GraphQLScalarType({
    name: "TransformedSpanAttributes",
    description:
      "A map of string keys to objects with a 'type' (STRING, NUMBER, BOOLEAN) and a 'value' (string).",
    parseValue(value) {
      transformedSpanSchema.shape.attributes.parse(value)
    }
  }),
};

// const queryResolvers: IResolvers = {
//   Query: {
//     allSpans: async (_, {limit}: {limit?: number}) => 
//   }
// }
