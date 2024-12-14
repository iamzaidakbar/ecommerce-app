import app from './app';
import env from './config/env';
import net from 'net';

const PORT = env.PORT || 3000;

const findAvailablePort = async (startPort: number): Promise<number> => {
  return new Promise((resolve) => {
    const server = net.createServer();
    
    server.listen(startPort, () => {
      const port = (server.address() as net.AddressInfo).port;
      server.close(() => resolve(port));
    });

    server.on('error', () => {
      resolve(findAvailablePort(startPort + 1));
    });
  });
};

const startServer = async () => {
  try {
    const availablePort = await findAvailablePort(PORT);
    
    app.listen(availablePort, () => {
      if (availablePort !== PORT) {
        console.log(`Port ${PORT} was busy, using port ${availablePort} instead`);
      }
      console.log(`Server running on port ${availablePort}`);
    });
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
};

startServer();