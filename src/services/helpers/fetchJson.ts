import { HttpRequestConfig } from '@/definitions';

const fetchJson = async (config: HttpRequestConfig) => {
  // const authToken = 'eyJhbGciOiJIUzI1NiJ9.NjYyYzhhMWZhZTFiMDE2ZWNjNDQ1YjE5.SHFCWFgCJIiuDoUMDQDiCx7qtbtcgXcb6UhvvYFo7mU';
  // const authToken = 'faaaa';

  try {
    const response = await fetch(config.url, {
      method: config.method,
      headers: config.headers,
      // headers: {
      //   Authorization: `Bearer ${authToken}`,
      //   'x-authorization-auth-type': 'token',
      // },
    } as RequestInit);
    console.log(response);
    return response.json();
  } catch (error) {
    console.error(error);
  }
};

export default fetchJson;
