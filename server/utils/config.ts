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
});

config.validate({ allowed: 'strict' });

export default config;
