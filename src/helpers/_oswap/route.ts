import Pool from './pool';

export default class Route {
  public pools: [Pool];

  constructor(pools: [Pool]) {
    this.pools = pools;
  }

  async init() {
    const promises = this.pools.map(pool => pool.init());
    await Promise.all(promises);
  }

  hasLiquidity() {
    this.pools.forEach(pool => {
      if (!pool.hasLiquidity()) return false;
    });
    return true;
  }

  // share: what share of inputAmount should be used to buy. The rest is a safety margin in case the prices change due to interest or other trades
  getAmountBoughtAndData(inputAmount, inputAsset, share = 1) {
    let i = 0;
    let data:any = {};
    while (this.pools[i]) {
      const pool = this.pools[i];
      const outputAsset = pool.x_asset === inputAsset ? pool.y_asset : pool.x_asset;
      const inputAssetLabel = inputAsset === pool.x_asset ? 'x' : 'y';
      const inputDeltaName = 'delta_' + inputAssetLabel + 'n';
      const { net_amount_out, delta } = pool.getAmountBoughtAndDelta(Math.round(inputAmount * share), inputAsset);
      if (i === 0) {
        data[inputDeltaName] = delta;
      }
      else {
        if (!data.hops)
          data.hops = [];
        data.hops.push({ address: pool.address, data: { [inputDeltaName]: delta } });
      }
      // for the next iteration
      inputAmount = net_amount_out;
      inputAsset = outputAsset;
      i++;
    }
    return { net_amount_out: inputAmount, data };
  }

  getAmountBought(inputAmount, inputAsset, share = 1) {
    let i = 0;
    while (this.pools[i]) {
      inputAmount = this.pools[i].getAmountBought(Math.round(inputAmount * share), inputAsset);
      inputAsset =
        this.pools[i].x_asset === inputAsset ? this.pools[i].y_asset : this.pools[i].x_asset;
      i++;
    }
    return inputAmount;
  }

  getAmountSold(outputAmount, outputAsset, share = 1) {
    let i = this.pools.length - 1;
    while (this.pools[i]) {
      outputAmount = this.pools[i].getAmountSold(outputAmount, outputAsset);
      outputAmount = Math.round(outputAmount / share);
      outputAsset =
        this.pools[i].x_asset === outputAsset ? this.pools[i].y_asset : this.pools[i].x_asset;
      i--;
    }
    return outputAmount;
  }
}
