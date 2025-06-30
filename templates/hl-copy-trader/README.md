## Overview

The Hyperliquid Copy Trader automatically replicates trades from expert traders on Hyperliquid DEX. Your copy trader runs securely inside a trusted execution environment (TEE).

## Prerequisites

Before setting up your copy trader, ensure you have:
- **USDC (perps)** funds to deposit into your Hyperliquid trading account
- The address of a trader you want to copy

## Step-by-Step Setup Instructions

### Step 1: Choose a Trader to Copy

1. Visit [Hyperdash Top Traders](https://hyperdash.info/top-traders) to browse successful traders
2. Select a trader whose strategy aligns with your risk tolerance
3. Copy their wallet address (starting with 0x)

### Step 2: Configure Your Copy Trader

1. **Trader Address to Copy** (Required)
  - Enter the wallet address of the trader you want to copy
  - Example: `0x1234567890abcdef...`
  - This address determines which trades your bot will replicate

2. **Withdrawal Address** (Set at later date to stop operations)
  - Leave empty for normal operation
  - Only set this if you want to emergency withdraw all funds or are happy with the results and want to stop the copy trades
  - When set, the bot will:
    - Cancel all open orders
    - Close all positions
    - Transfer all USDC to this address

### Step 3: Fund Your Trading Account

1. After deploying your ROFL app, check the logs to find your bot's trading address
2. Send USDC (Perps) to this address on Hyperliquid
3. The bot will automatically detect the funds and start listening for trades

⚠️  **IMPORTANT: Only send USDC (Perps) on Hyperliquid!**  
⚠️  **Sending funds on any other chain or to the wrong account type**  
⚠️  **may result in PERMANENT LOSS OF FUNDS!**

**Important Funding Considerations:**
- Fund your account proportionally to the trader you're copying
- If your account is too small relative to the copied trader, some trades may not execute
- Minimum trade size on Hyperliquid is $10
- Example: If the copied trader has $100,000 and opens a $100 position (0.1%), you need at least $10,000 to copy this trade or it will be skipped
  
## Risk Warning

**Copy trading involves substantial risk:**
- You can lose all deposited funds
- Past performance does not guarantee future results
- The copied trader's strategy may not suit your risk tolerance
- Technical issues or network delays may affect trade execution
- Trade at your own discretion and only risk what you can afford to lose

## Troubleshooting

- **Bot not copying trades**: Ensure your account has sufficient funds for the minimum trade size
- **Finding your bot's address**: Check the ROFL app logs after deployment
- **How to withdraw**: Set the WITHDRAW_FUNDS_TO address and restart the app
