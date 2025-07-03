import { initializeServer } from './server';
import { env } from './config/environment';

const start = async () => {
  try {
    const server = await initializeServer();
    await server.listen({ port: parseInt(env.PORT), host: '0.0.0.0' });
    console.log(`Server listening on port ${env.PORT}`);
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
};

start();