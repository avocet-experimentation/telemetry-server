const transformedSpanGQLSchema = /* GraphQL */ `
  scalar TransformedSpanAttributes

  scalar ExperimentData

  enum PrimitiveTypeLabel {
    STRING
    NUMBER
    BOOLEAN
  }

  type TransformedSpan {
    traceId: String!
    spanId: String!
    parentSpanId: String
    name: String!
    kind: Float!
    startTimeUnixNano: String!
    endTimeUnixNano: String!
    attributes: TransformedSpanAttributes!
  }

`;


const querySchema = /* GraphQL */ `
  type Query {
    allSpans(limit: Int, offset: Int): [TransformedSpan!]!
    findSpansByValue(value: String!): [TransformedSpan!]!
    experimentData(experimentId: String!, conditionRefs: [String!]!, dependentVariables: [String!]!): ExperimentData!
  }
`;
export const schemas = /* GraphQL */ `
  ${transformedSpanGQLSchema},
  ${querySchema},
`;