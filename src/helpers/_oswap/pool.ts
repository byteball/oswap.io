import { getInfo } from './';
import { getPoolState, getSwapParams, getSwapParamsByOutput, getRedemptionResult, toAsset, getLeveragedBuyParams, getLeveragedSellParams, getCurrentUtilizationRatio, setLogger } from 'oswap-v2-sdk';

type Balance = {
  x: number;
  y: number;
  xn: number;
  yn: number;
};

//setLogger(console.log);

export default class Pool {
  public ready: boolean = false;
  public address: string;
  public x_asset: string;
  public y_asset: string;
  public Lambda: number = 0;
  public p_min: number = 0;
  public p_max: number = Infinity;
  public swapFee: number = 0;
  public asset?: string;
  public supply?: number;
  public base?: number;
  public balances: Balance = { x: 0, y: 0, xn: 0, yn: 0 };
  public params: Object = {};
  public stateVars: Object = {};
  public info: Object = {};

  constructor(address, assets) {
    this.x_asset = assets[0];
    this.y_asset = assets[1];
    this.address = address;
  }

  async init() {
    const { info, stateVars, params } = await getInfo(this.address);
    this.stateVars = stateVars;
    this.params = params;
    this.info = info;
    this.x_asset = params.x_asset;
    this.y_asset = params.y_asset;
    this.swapFee = info.swap_fee;
    this.Lambda = info.Lambda;
    this.asset = info.lp_shares.asset;
    if (info.balances)
      this.balances = info.balances;
    if (info.mid_price) {
      const beta = 1 - info.alpha;
      this.p_max = info.alpha / beta * info.price_deviation ** (1 / beta) * info.mid_price;
      this.p_min = info.alpha / beta / info.price_deviation ** (1 / beta) * info.mid_price;
    }
    this.supply = info.lp_shares.issued;
    if (info.x_asset === 'base') this.base = this.balances.xn;
    if (info.y_asset === 'base') this.base = this.balances.yn;
    this.ready = true;
  }

  hasLiquidity() {
    return !(!this.balances.x || !this.balances.y || !this.supply);
  }

  getAmountBoughtAndDelta(inputAmount, inputAsset) {
    const poolState = getPoolState(this.params, this.stateVars);
    const swapParams = getSwapParams(inputAmount, inputAsset, poolState);
    console.log(swapParams);
    const { res, delta_Yn } = swapParams;
    return { net_amount_out: res.net_amount_X, delta: delta_Yn };
  }

  getAmountBought(inputAmount, inputAsset) {
    const poolState = getPoolState(this.params, this.stateVars);
    const swapParams = getSwapParams(inputAmount, inputAsset, poolState);
    console.log(swapParams);
    const { res, delta_Yn } = swapParams;
    return res.net_amount_X;
  }

  getAmountSold(outputAmount, outputAsset) {
    const poolState = getPoolState(this.params, this.stateVars);
    const swapParams = getSwapParamsByOutput(outputAmount, outputAsset, poolState);
    console.log(swapParams);
    const { res, delta_Yn } = swapParams;
    return res.amount_Y;
  }

  getLeveragedBuyParams(inputAmount, inputAsset, leverage) {
    const poolState = getPoolState(this.params, this.stateVars);
    const { res, delta } = getLeveragedBuyParams(inputAmount, inputAsset, leverage, poolState);
    return { res, delta };
  }

  getLeveragedSellParams(inputAmount, asset, leverage, entry_price) {
    const poolState = getPoolState(this.params, this.stateVars);
    console.log('pool state', poolState, {inputAmount, asset, leverage, entry_price})
    const { res, delta } = getLeveragedSellParams(inputAmount, asset, leverage, entry_price, poolState);
    return { res, delta };
  }

  getRedemptionAmounts(received_shares_amount, asset) {
    const poolState = getPoolState(this.params, this.stateVars);
    const res = getRedemptionResult(received_shares_amount, asset, poolState);
    console.log(res);
    return res;
  }

  getCurrentUtilizationRatio() {
    const poolState = getPoolState(this.params, this.stateVars);
    return getCurrentUtilizationRatio(poolState);
  }

  getBorrowedAmounts() {
    const res = { x: 0, y: 0, borrowed_to_assets: 0 };
    const poolState = getPoolState(this.params, this.stateVars);
    const { balances, leveraged_balances, profits, shifts: { x0, y0 }, pool_props: { alpha, beta } } = poolState;
    const px = alpha / beta * (balances.y + y0) / (balances.x + x0);
    for (let leverageKey in leveraged_balances) {
      const bal = leveraged_balances[leverageKey].balance;
      const signedL = parseFloat(leverageKey); // '-2x' => -2
      const L = Math.abs(signedL);
      if (signedL > 0)
        res.y += (L - 1) / L * bal * px;
      else
        res.x += (L - 1) / L * bal / px;
    }
    if (res.x || res.y) {
      const borrowed_in_y = res.y + px * res.x;
      const assets_in_y = balances.yn + profits.y + px * (balances.xn + profits.x);
      res.borrowed_to_assets = borrowed_in_y / assets_in_y;
    }
    return res;
  }

  assetValue(value, asset) {
    const decimals = asset ? asset.decimals : 0;
    return value / 10 ** decimals;
  }

  getPrice(assetId, settings) {
    // @ts-ignore
    if (this.balances.x && this.balances.y || this.info.mid_price) {
      const poolState = getPoolState(this.params, this.stateVars);
      const { balances, shifts: { x0, y0 }, pool_props: { alpha, beta } } = poolState;
      const asset = settings.assets[assetId];
      const decimals = asset ? asset.decimals : 0;
      const px = alpha / beta * (balances.y + y0) / (balances.x + x0);
      if (this.x_asset == assetId) {
        return px * 10 ** decimals;
      } else if (this.y_asset == assetId) {
        return 1 / px * 10 ** decimals;
      }
    }
    return 0;
  }

  getMarketcap(settings) {
    let assetXValue = 0;
    let assetYValue = 0;
    if (this.base) {
      assetXValue = assetYValue = (settings.exchangeRates.GBYTE_USD / 1e9) * this.base;
    } else {
      const x_asset_id = this.x_asset === 'base' ? 'GBYTE' : this.x_asset;
      const y_asset_id = this.y_asset === 'base' ? 'GBYTE' : this.y_asset;
      const x_asset = settings.assets[x_asset_id];
      const y_asset = settings.assets[y_asset_id];
      assetXValue = settings.exchangeRates[`${x_asset_id}_USD`]
        ? settings.exchangeRates[`${x_asset_id}_USD`] * this.assetValue(this.balances.xn, x_asset)
        : 0;
      assetYValue = settings.exchangeRates[`${y_asset_id}_USD`]
        ? settings.exchangeRates[`${y_asset_id}_USD`] * this.assetValue(this.balances.yn, y_asset)
        : 0;
    }
    return assetXValue && assetYValue ? assetXValue + assetYValue : 0;
  }
}
