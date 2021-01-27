import CGCServer from './Server';
import WSServer from './WSServer';

const port = 3000;
const server = new CGCServer();
const wsServer = new WSServer(server.start(port));

