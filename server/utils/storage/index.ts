import config from '~/server/utils/config';
import type { StorageDriver } from './types';

// Singleton — one driver instance per server process.
let _driver: StorageDriver | undefined;

export const getStorage = async (): Promise<StorageDriver> => {
  if (_driver) return _driver;

  const backend = config.get('storageDriver');

  switch (backend) {
    case 'vercel-blob': {
      const { VercelBlobDriver } = await import('./vercel-blob');
      _driver = new VercelBlobDriver();
      break;
    }
    default: {
      const { LocalDriver } = await import('./local');
      _driver = new LocalDriver();
    }
  }

  return _driver!;
};

// Allow tests to inject a mock driver without going through the env var.
export const setStorageDriver = (driver: StorageDriver) => {
  _driver = driver;
};

export const resetStorageDriver = () => {
  _driver = undefined;
};
