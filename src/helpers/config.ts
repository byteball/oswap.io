import config from '@/config.json';

let network = process.env.VUE_APP_NETWORK || 'livenet';
const domainName = window.location.hostname;
if (domainName === 'testnet.oswap.io' || domainName === 'v1-testnet.oswap.io' || domainName === 'v2-testnet.oswap.io') network = 'testnet';

if (process.env.VUE_APP_GTAG_ID)
  config[network].gtag_id = process.env.VUE_APP_GTAG_ID;

export default config[network];
