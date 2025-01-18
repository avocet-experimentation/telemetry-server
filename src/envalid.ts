import 'dotenv/config';
import { cleanEnv, num, str } from 'envalid';

const env = cleanEnv(process.env, {
  PORT: num(),
  KEYSPACE: str(),
  COMPONENT_NAME: str(),
});

export default env;
