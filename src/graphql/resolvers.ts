import { ExperimentDraft, FeatureFlag, pickKeys, TextPrimitive, transformedSpanSchema } from "@avocet/core";
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

// find spans for an experiment by finding all spans with
// a metadata key matching any of the flags on the experiment
// and a value on that key starting with the experiment ID or
// matching any of the experimentId+groupId+treatmentId combinations
// (see the ExperimentDraft.getAllConditionRefs helper)

const experimentDraft = ExperimentDraft.template({
  name: 'saltwater-live-update',
  environmentName: 'production',
});

const experiment =  { ...experimentDraft, id: crypto.randomUUID() };

const queryResolvers: IResolvers = {
  Query: {
    allSpans: async (_, {limit, offset}: {limit?: number, offset?: number}) => {
      const allSpans = await spanMapper.findAll();
      return transformedSpanSchema.array().parse(allSpans);
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
      // assume each condition ref is `groupId+treatmentId`
      const promises = conditionRefs.map(async (ref) => {
        const result = await spanMapper.getByValue({
          value: { type: 'string', value: `${experimentId}+${ref}` },
        });
        const spans = transformedSpanSchema.array().parse(result.toArray());
        return [ref, spans] as const;
      });

      const conditionSpans = await Promise.all(promises);

      const experimentDataEntries = conditionSpans.map(([ref, spans]) => {
        const dependents = dependentVariables.reduce(
          (acc: Record<string, TextPrimitive[]>, el) => Object
            .assign(acc, { [el]: []}), {});
        
        spans.forEach((span) => {
          dependentVariables.forEach((dep) => {
            const data = span.attributes[dep];
            dependents[dep].push(data?.value ?? null);
          });
        });

        return [ref, dependents];
      });

      return Object.fromEntries(experimentDataEntries);
    },
  }
}

export const resolvers = {
  ...scalarResolvers,
  ...queryResolvers,
}