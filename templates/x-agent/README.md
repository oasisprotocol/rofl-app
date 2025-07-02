# Persona X Agent

## Overview

The X Agent is an AI-powered Twitter bot that automatically posts tweets every
hour based on your defined personality. Your bot runs securely inside a trusted
execution environment (TEE), keeping your API keys and content generation
private.

## Prerequisites

Before setting up your bot, ensure you have:

- A Twitter/X account
- Access to Twitter Developer Portal
- An OpenAI account with API access
- Available API credits on both platforms

## Step-by-Step Setup Instructions

### Step 1: Get Your OpenAI API Key

1. Visit [OpenAI API Keys](https://platform.openai.com/api-keys)
2. Sign in to your OpenAI account
3. Click **"Create new secret key"**
4. Give your key a descriptive name
5. Set permissions to "All"
6. Copy and save the key (starts with `sk-`)
7. Ensure you have credits by checking [OpenAI Billing][billing]

[billing]: https://platform.openai.com/settings/organization/billing/overview

### Step 2: Get Your Twitter API Credentials

1. Go to [Twitter Developer Portal](https://developer.x.com/en/portal/dashboard)
2. Navigate to **"Projects & Apps"**
3. Select your app or create a new one
4. Go to your app settings
5. Under **"User authentication settings"**, click **"Set up"**
6. Configure as follows:

   - **App permissions**: Read and write
   - **Type of App**: Web App, Automated App or Bot
   - **App info**: Add any URL for Callback URI and Website URL (not used but
     required)

7. Click **"Save"**
8. Go back to your app settings
9. Click **"Keys and tokens"**
10. Generate and save all of these:

    - API Key
    - API Key Secret
    - Bearer Token
    - Access Token
    - Access Token Secret

### Step 3: Configure Your Bot

1. **Bot Persona** (Required)

   - Define your bot's personality and posting style
   - Examples:
     - "You are a tech enthusiast sharing insights about AI and Web3"
     - "You are a motivational coach posting daily inspiration"
     - "You are a crypto analyst sharing market observations"

2. **Twitter Credentials** (All Required)

   - **Bearer Token**: For API authentication
   - **API Key**: Your app's API key
   - **API Secret**: Your app's API secret
   - **Access Token**: For posting as your account
   - **Access Token Secret**: Secret for the access token

3. **OpenAI Settings**

   - **API Key**: Your OpenAI secret key (sk-...)
   - **Model**: Choose based on your needs:
     - **GPT-3.5 Turbo**: Fast and cost-effective
     - **GPT-4o Mini**: Good balance of quality and cost
     - **GPT-4o**: Best for complex content

### Step 4: Monitor Your Bot

1. Your bot will start posting automatically every hour
2. Check your Twitter account to see the generated tweets
3. The bot maintains context to avoid repetitive content
4. All tweet generation happens privately within the TEE

## Important Notes

- Ensure your OpenAI account has sufficient credits
- Twitter API has rate limits - the hourly schedule respects these
- Your API keys are encrypted and never exposed
- The bot will continue posting until you stop the ROFL app
