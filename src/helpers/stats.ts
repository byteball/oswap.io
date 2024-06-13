import config from '@/helpers/config';


const request = async (url: string, options = {}) => {
  const response = await fetch(url, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    mode: 'cors',
    ...options
  });

  if (response.status !== 200) {
    const { error } = await response.json();
    throw new Error(error);
  }

  return await response.json();
}

async function getAPY7d() {
  try {
    return await request(`${config.statsApiUrl}/api/v1/apy7d`);
  }
  catch (e) {
    console.log(`fetch APY failed`, e);
    return {};
  }
}


export default getAPY7d;
