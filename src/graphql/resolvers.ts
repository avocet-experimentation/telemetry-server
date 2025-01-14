import { TransformedSpanAttributes } from "@avocet/core";
import { IResolvers } from "mercurius";
import { GraphQLScalarType } from "graphql";

const PrimitiveTypeLabels = ["STRING", "NUMBER", "BOOLEAN"] as const;
type PrimitiveTypeLabel = (typeof PrimitiveTypeLabels)[number];

function validateAttributes(value: TransformedSpanAttributes): boolean {
  if (typeof value !== 'object' || value === null ) {
    throw new Error('TransformedSpanAttributes must be an object with string keys.')
  }

  for (const [key, attr] of Object.entries(value)) {
    if (typeof key !== 'string') {
      throw new Error('All keys in TransformedSpanAttributes must be strings.')
    }

    if (typeof attr !== 'object' || attr === null || typeof attr.type !== 'string' || !PrimitiveTypeLabels.includes(attr.type as PrimitiveTypeLabel) || typeof attr.value !== 'string') {
      throw new Error(
        `Each value in TransformedSpanAttributes must be an object with a valid 'type' and 'value'. Found: ${JSON.stringify(attr)}`
      );
    }
  }
  return true;
}

const scalarResolvers: IResolvers = {
  TransformedSpanAttributes: new GraphQLScalarType({
    name: "TransformedSpanAttributes",
    description:
      "A map of string keys to objects with a 'type' (STRING, NUMBER, BOOLEAN) and a 'value' (string).",
    serialize(value) {
      if (validateAttributes(value)) {
        return value;
      }
      throw new Error("Invalid TransformedSpanAttributes value.");
    },
    parseValue(value) {
      if (validateAttributes(value)) {
      return value;
    }
    throw new Error("Invalid TransformedSpanAttributes value.");
    }
  }),
};

const queryResolvers: IResolvers = {
  Query: {
    allSpans: async (_, {limit}: {limit?: number}) => 
  }
}
