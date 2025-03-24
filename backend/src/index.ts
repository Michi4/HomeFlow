import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';

const app = new Hono();

app.use('*', logger(), prettyJSON());

app.get('/', (c) => c.json({ hello: 'HomeFlow 🏠' }));

export default app;
