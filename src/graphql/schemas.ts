export const transformedSpanGQLSchema = /* GraphQL */ `
  scalar TransformedSpanAttributes

  enum PrimitiveTypeLabel {
    STRING
    NUMBER
    BOOLEAN
  }

  interface TransformedSpan {
    traceId: String!
    spanId: String!
    parentSpanId: String!
    name: String!
    kind: Int!
    startTimeUnixNano: String!
    endTimeUnixNano: String!
    attributes: TransformedSpanAttributes!
  }
`;
