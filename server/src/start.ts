import CGCServer from './Server';
import WSServer from './WSServer';

const port = process.env.PORT ? +process.env.PORT : 3000;
const server = new CGCServer();
new WSServer(server.start(port));

