export interface DataPoint {
    x: number;
    y: number;
    rating: string;
}

export interface FearAndGreed {
    score: number;
    rating: string;
    timestamp: string;
    previous_close: number;
    previous_1_week: number;
    previous_1_month: number;
    previous_1_year: number;
}

export interface FearAndGreedHistorical {
    timestamp: number;
    score: number;
    rating: string;
    data: DataPoint[];
}

export interface MarketMomentumSp500 {
    timestamp: number;
    score: number;
    rating: string;
    data: DataPoint[];
}

export interface MarketMomentumSp125 {
    timestamp: number;
    score: number;
    rating: string;
    data: DataPoint[];
}

export interface StockPriceStrength {
    timestamp: number;
    score: number;
    rating: string;
    data: DataPoint[];
}

export interface StockPriceBreadth {
    timestamp: number;
    score: number;
    rating: string;
    data: DataPoint[];
}

export interface PutCallOptions {
    timestamp: number;
    score: number;
    rating: string;
    data: DataPoint[];
}

export interface MarketVolatilityVix {
    timestamp: number;
    score: number;
    rating: string;
    data: DataPoint[];
}

export interface MarketVolatilityVix50 {
    timestamp: number;
    score: number;
    rating: string;
    data: DataPoint[];
}

export interface JunkBondDemand {
    timestamp: number;
    score: number;
    rating: string;
    data: DataPoint[];
}

export interface SafeHavenDemand {
    timestamp: number;
    score: number;
    rating: string;
    data: DataPoint[];
}

export interface CNNFearGreedResponse {
    fear_and_greed: FearAndGreed;
    fear_and_greed_historical: FearAndGreedHistorical;
    market_momentum_sp500: MarketMomentumSp500;
    market_momentum_sp125: MarketMomentumSp125;
    stock_price_strength: StockPriceStrength;
    stock_price_breadth: StockPriceBreadth;
    put_call_options: PutCallOptions;
    market_volatility_vix: MarketVolatilityVix;
    market_volatility_vix_50: MarketVolatilityVix50;
    junk_bond_demand: JunkBondDemand;
    safe_haven_demand: SafeHavenDemand;
}
