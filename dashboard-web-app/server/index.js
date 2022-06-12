import express from 'express';
import { createServer } from 'http';

import { handler } from '../build/handler.js'
import { initializePersistDataService } from '../services/persistDataService.js';

console.log('Starting Production Server Persist Data Service..\n');
initializePersistDataService();

const app = express();

// SvelteKit should handle everything else using Express middleware
// https://github.com/sveltejs/kit/tree/master/packages/adapter-node#custom-server
app.use(handler);

const port = 3000;
const server = createServer(app);
server.listen(port);