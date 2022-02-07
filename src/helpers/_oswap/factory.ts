
export default class Factory {
  public pools: [];
  public pairs: [];

  constructor(pools, pairs) {
    this.pools = pools;
    this.pairs = pairs;
  }

  getPoolsByPair(assetA, assetB) {
    const pair = this.pairs[(assetA < assetB) ? (assetA + '_' + assetB) : (assetB + '_' + assetA)];
    return pair && pair.pools ? pair.pools : [];
  }
}
