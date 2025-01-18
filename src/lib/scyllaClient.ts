import cassandra from 'cassandra-driver';
import env from '../envalid';
import { addProp, SpanAttribute } from '@avocet/core';

export const client = new cassandra.Client({
  contactPoints: ['localhost'],
  localDataCenter: 'datacenter1',
  keyspace: env.KEYSPACE,
});

const valueTypeMapping = {
  intValue: 'number',
  stringValue: 'string',
  arrayValue: 'list',
};

type SpanAttributeMapping = Record<string, { type: string, value: string }>;

/* 
  - Takes snake case property fields of all spans and turns them into camel case when being fetched.
  - Takes attribute property and outputs array of objects 
*/
export const mapper = new cassandra.mapping.Mapper(client, {
  models: {
    'Span': {
      tables: ['spans'],
      mappings: new cassandra.mapping.UnderscoreCqlToCamelCaseMappings(),
      columns: {
        kind: {
          name: 'kind',
          fromModel: (kind: number) => String(kind),
        },
        attributes: {
          name: 'attributes',
          // toModel: (data) => data, 
          fromModel: (spanAttributes: SpanAttribute[]) => {
            
            const mapping = spanAttributes.reduce((acc: SpanAttributeMapping, attr) => {
              const { key, value } = attr;
              const valueKey = Object.keys(value)[0];

              return { ...acc, ...{ [key]: {
                  type: valueTypeMapping[valueKey], // number, string, list
                  value: value[valueKey], // value stored within "value" key
                } } };
            }, {});
          
            console.log({mapping});
            return mapping;
        }
        }
      }
    },
  },
});

const baseSpanMapper = mapper.forModel('Span');

const getByType = () => {
  const selectByTypeQuery = `SELECT * FROM spans ` + 
                          `WHERE attributes CONTAINS KEY ? ` + 
                          `ALLOW FILTERING`;


 return baseSpanMapper.mapWithQuery(selectByTypeQuery, (paramObj) => [paramObj.type])
};

addProp(baseSpanMapper, 'getByType', getByType);

const spanMapper = baseSpanMapper;
export { spanMapper };