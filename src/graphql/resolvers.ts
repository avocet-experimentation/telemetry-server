import { ConditionReferenceString, TextPrimitive, TransformedSpan, transformedSpanSchema } from "@avocet/core";
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
  ExperimentData: new GraphQLScalarType({
    name: 'ExperimentData',
    parseValue(value) {
      return value; // TODO: add schema parse
    }
  })
};

const getDependentData = (dependentVariables: string[], spans: TransformedSpan[]) => {
  const dataObj = dependentVariables.reduce(
    (acc: Record<string, TextPrimitive[]>, el) => Object
      .assign(acc, { [el]: []}),
    {},
  );

  spans.forEach((span) => {
    dependentVariables.forEach((dep) => {
      if (dep in span.attributes) {
        dataObj[dep].push(span.attributes[dep].value);
      }
    })
  });

  return dataObj;
};

const queryResolvers: IResolvers = {
  Query: {
    allSpans: async (_, { limit, offset }: {limit?: number, offset?: number}) => {
      const allSpans = await spanMapper.findAll();
      return allSpans.toArray();
    },
    findSpansByValue: async (_, {value}: {value: string}) => {
      const spans = await spanMapper.getByValue({ value: { type: 'string', value } });
      return spans.toArray();
    },
    experimentData: async (_, {
      experimentId,
      conditionRefs,
      dependentVariables
    }: {
      experimentId: string,
      conditionRefs: string[],
      dependentVariables: string[],
    }) => {
      const promises = conditionRefs.map(async (ref) => {
        const fetchResult = await spanMapper.getByValue({
          value: { type: 'string', value: `${experimentId}+${ref}` },
        });

        const spans = fetchResult.toArray() as TransformedSpan[];
        const conditionData = getDependentData(dependentVariables, spans);
        console.log(conditionData); // TODO: remove
        return [ref, conditionData];
      });
      try {
        const resolve = await Promise.all(promises);
        const data: Record<ConditionReferenceString, Record<string, TextPrimitive[]>> = Object.fromEntries(resolve);
        return data;
      } catch (e) {
        console.error(e);
        return {};
      }
    },
  }
}

export const resolvers = {
  ...scalarResolvers,
  ...queryResolvers,
}