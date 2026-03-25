import { config } from 'dotenv';
import * as path from 'path';

export default async function globalSetup(): Promise<void> {
  config({ path: path.resolve(process.cwd(), '.env.test') });
  process.env['NODE_ENV'] = 'test';
}
