import type { ApiFieldError } from '@repo/types/api/errors';

const error: ApiFieldError = {
  message: '',
  source: '',
};

const App = () => <h1>{JSON.stringify(error, null, 2)}</h1>;

export { App };
