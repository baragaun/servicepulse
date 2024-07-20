import { HttpRequestConfig } from '@/definitions';

const fetchJson = async (
  config: HttpRequestConfig
): Promise<{
  response: Response | undefined;
  data?: any;
  error?: string;
}> => {
  let response: Response | undefined;

  try {
    response = await fetch(config.url, {
      method: config.method,
      headers: config.headers,
      body: config.data,
    } as RequestInit);

    console.log(response);

    if (!response) {
      return { response, error: 'no-response' };
    }

    if (response.status > 399) {
      try {
        const data = await response.text();
        const error = response.status === 401 ? 'unauthorized' : 'server-error';
        return { response, error, data };
      } catch (error) {
        console.error(error);
        return { response, error: 'server-error' };
      }
    }

    try {
      const data = await response.json();
      return { response, data };
    } catch (error) {
      console.error(error);
      return { response, error: 'error-reading-response' };
    }
  } catch (error) {
    console.error(error);
    return { response, error: error.message };
  }
};

export default fetchJson;
