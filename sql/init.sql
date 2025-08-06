-- Fear & Greed Index table
create table fgi_hourly (
  ts_utc  timestamptz primary key,
  score   smallint     not null,
  label   text         not null
);

-- Generic indicators table for extensibility
create table indicators (
  id          text primary key,
  name        text not null,
  description text,
  category    text not null,
  source      text not null,
  is_active   boolean default true,
  created_at  timestamptz default now()
);

-- Generic indicator data
create table indicator_data (
  id          serial primary key,
  indicator_id text references indicators(id),
  ts_utc      timestamptz not null,
  value       decimal not null,
  label       text,
  metadata    jsonb,
  created_at  timestamptz default now(),
  unique(indicator_id, ts_utc)
);

-- Analytics tracking for popular indicators
create table indicator_views (
  id          serial primary key,
  indicator_id text references indicators(id),
  viewed_at   timestamptz default now(),
  user_agent  text,
  ip_hash     text
);

-- Insert initial indicators
insert into indicators (id, name, description, category, source) values
('cnn-fgi', 'CNN Fear & Greed Index', 'Market sentiment indicator from CNN', 'sentiment', 'CNN'),
('crypto-fgi', 'Crypto Fear & Greed Index', 'Cryptocurrency market sentiment', 'crypto', 'Alternative.me'),
('warren-buffett', 'Warren Buffett Indicator', 'Market cap to GDP ratio', 'valuation', 'FRED'),
('vix', 'VIX Volatility Index', 'Market volatility and fear gauge', 'volatility', 'CBOE'),
('cnn-sp500-momentum', 'S&P 500 Market Momentum', 'S&P 500 momentum indicator from CNN', 'momentum', 'CNN'),
('cnn-sp125-momentum', 'S&P 125 Market Momentum', 'S&P 125 momentum indicator from CNN', 'momentum', 'CNN'),
('cnn-stock-strength', 'Stock Price Strength', 'Stock price strength indicator from CNN', 'strength', 'CNN'),
('cnn-stock-breadth', 'Stock Price Breadth', 'Stock price breadth indicator from CNN', 'breadth', 'CNN'),
('cnn-put-call', 'Put-Call Options', 'Put-call options ratio from CNN', 'options', 'CNN'),
('cnn-vix', 'Market Volatility (VIX)', 'VIX volatility indicator from CNN', 'volatility', 'CNN'),
('cnn-vix50', 'Market Volatility (VIX50)', 'VIX50 volatility indicator from CNN', 'volatility', 'CNN'),
('cnn-junk-bond', 'Junk Bond Demand', 'Junk bond demand indicator from CNN', 'bonds', 'CNN'),
('cnn-safe-haven', 'Safe Haven Demand', 'Safe haven demand indicator from CNN', 'safe-haven', 'CNN');
