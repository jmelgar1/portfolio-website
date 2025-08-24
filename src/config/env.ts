export interface EnvConfig {
  apiUrl: string;
  environment: 'local' | 'dev' | 'prod';
}

const getEnvConfig = (): EnvConfig => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const environment = import.meta.env.VITE_ENV as EnvConfig['environment'];

  if (!apiUrl) {
    throw new Error('VITE_API_URL environment variable is not defined');
  }

  return {
    apiUrl,
    environment: environment || 'dev',
  };
};

export const env = getEnvConfig();