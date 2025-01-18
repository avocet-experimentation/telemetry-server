import { transformedSpanSchema } from "@avocet/core";
import { IResolvers } from "mercurius";
import { GraphQLScalarType } from "graphql";
import { spanMapper } from "../lib/scyllaClient";

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

// find spans for an experiment by finding all spans with
// a metadata key matching any of the flags on the experiment
// and a value on that key starting with the experiment ID or
// matching any of the experimentId+groupId+treatmentIdcombinations
// (see the ExperimentDraft.getAllConditionRefs helper)

const queryResolvers: IResolvers = {
  Query: {
    allSpans: async (_, {limit, offset}: {limit?: number, offset?: number}) => {
      const allSpans = await spanMapper.findAll();
      return transformedSpanSchema.array().parse(allSpans);
    },
    findSpansByValue: async (_, {value}: {value: string}) => {
      const spans = spanMapper.getByValue({value});
      return spans;
    },
    // experimentData: async (_, {experimentId, flagNames, dependentVariables}: {experimentId: string, flagNames: string[], dependentVariables: string[]}) => {
    //   return
    // },
  }
}
