import express from 'express';
import { createServer } from 'http';

import { handler } from '../build/handler.js'
import { initializeDataService } from '../services/dataService.js';

console.log('Starting Production Server Data Service..\n');

const port = 3000;

const app = express();
const server = createServer(app);

initializeDataService(server);

// SvelteKit should handle everything else using Express middleware
// https://github.com/sveltejs/kit/tree/master/packages/adapter-node#custom-server
app.use(handler);

server.listen(port);