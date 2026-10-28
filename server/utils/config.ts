import convict from 'convict';

const config = convict({
  env: {
    doc: 'Application environment',
    format: ['production', 'development', 'test'],
    default: 'development',
    env: 'NODE_ENV',
  },
  githubAllowedLogin: {
    doc: 'Exact GitHub username (case-sensitive) allowed to access /admin',
    format: String,
    default: '',
    env: 'GITHUB_ALLOWED_LOGIN',
  },
  storageDriver: {
    doc: "Storage backend to use: 'local' (filesystem) or 'vercel-blob'",
    format: ['local', 'vercel-blob'],
    default: 'local' as 'local' | 'vercel-blob',
    env: 'STORAGE_DRIVER',
  },
  blobAssetsToken: {
    doc: 'Read-write token of the public Blob store holding images (vercel-blob driver)',
    format: String,
    default: '',
    env: 'BLOB_READ_WRITE_TOKEN',
    sensitive: true,
  },
  blobDataToken: {
    doc: 'Read-write token of the private Blob store holding JSON data (vercel-blob driver)',
    format: String,
    default: '',
    env: 'BLOB_DATA_READ_WRITE_TOKEN',
    sensitive: true,
  },
});

config.validate({ allowed: 'strict' });

export default config;
