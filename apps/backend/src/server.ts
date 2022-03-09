// eslint-disable-next-line import/order
import dotenv from 'dotenv';

dotenv.config();

/* eslint-disable import/first */
import http from 'node:http';

import { app } from '@/app';
/* eslint-enable import/first */

const server = http.createServer(app);

server.listen(process.env.PORT);

process.on('SIGTERM', () => server.close());