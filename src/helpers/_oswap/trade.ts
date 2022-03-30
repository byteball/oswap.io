import Route from './route';
import Pool from './pool';
import Factory from './factory';

export default class Trade {
  public factory: Factory;
  public inputAsset: string;
  public outputAsset: string;
  public routes?: [] = [];

  constructor(factory, inputAsset, outputAsset) {
    this.factory = factory;
    this.inputAsset = inputAsset;
    this.outputAsset = outputAsset;
  }

  /*
  getRoute(inputAmount, share = 1) {
    let bestRoute: any;
    let maxAmount = 0;
    // @ts-ignore
    this.routes.forEach((route, i) => {
      // @ts-ignore
      const outputAmount = route.getAmountBought(inputAmount, this.inputAsset, share);
      if (outputAmount > maxAmount) {
        maxAmount = outputAmount;
        bestRoute = route;
      }
    });
    return bestRoute;
  }
  */

  // share: what share of inputAmount should be used to buy. The rest is a safety margin in case the prices change due to interest or other trades
  getAmountBoughtAndData(inputAmount, share = 1) {
    let bestRoute: any;
    let maxAmount = 0;
    let bestRouteData;
    // @ts-ignore
    this.routes.forEach((route, i) => {
      try {
        // @ts-ignore
        const { net_amount_out, data } = route.getAmountBoughtAndData(inputAmount, this.inputAsset, share);
        if (net_amount_out > maxAmount) {
          maxAmount = net_amount_out;
          bestRouteData = data;
          bestRoute = route;
        }
      }
      catch (e) {
        console.log('getAmountBoughtAndData failed', e);
      }
    });
    return { net_amount_out: maxAmount, data: bestRouteData, route: bestRoute };
  }

  /*
  getAmountBought(inputAmount, share = 1) {
    let maxAmount = 0;
    // @ts-ignore
    this.routes.forEach((route, i) => {
      // @ts-ignore
      const outputAmount = route.getAmountBought(inputAmount, this.inputAsset, share);
      if (outputAmount > maxAmount) maxAmount = outputAmount;
    });
    return maxAmount;
  }
  */

  getAmountSold(outputAmount, share = 1) {
    let minAmount = 0;
    // @ts-ignore
    this.routes.forEach((route, i) => {
      try {
        // @ts-ignore
        const inputAmount = route.getAmountSold(outputAmount, this.outputAsset, share);
        if (inputAmount > 0) {
          if (!minAmount || inputAmount < minAmount) minAmount = inputAmount;
        }
      }
      catch (e) {
        console.log('getAmountSold failed', e);
      }
    });
    return minAmount;
  }

  async init() {
    let directPools = this.factory.getPoolsByPair(this.inputAsset, this.outputAsset);
    // @ts-ignore
    directPools.forEach(directPool => this.routes.push(this.toRoute([directPool])));
    if (this.inputAsset !== 'base' && this.outputAsset !== 'base') {
      const swap0Pools = this.factory.getPoolsByPair(this.inputAsset, 'base');
      const swap1Pools = this.factory.getPoolsByPair('base', this.outputAsset);
      // @ts-ignore
      if (swap0Pools && swap1Pools) {
        swap0Pools.forEach(pool0 => {
          swap1Pools.forEach(pool1 => {
            // @ts-ignore
            this.routes.push(this.toRoute([pool0, pool1]));
          });
        });
      }
    }
    // @ts-ignore
    const promises = this.routes.map(route => route.init());
    await Promise.all(promises);
  }

  toRoute(addresses): Route {
    const pools = addresses.map(address => {
      const pool = this.factory.pools[address];
      // @ts-ignore
      return new Pool(address, [pool.x_asset, pool.y_asset]);
    });
    return new Route(pools);
  }
}
