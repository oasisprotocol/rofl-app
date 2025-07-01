# Private Telegram Chat Bot

## Overview

The Private Telegram Chat Bot runs a confidential AI assistant entirely inside
a trusted execution environment (TEE). All conversations and the AI model stay
completely private within the secure enclave.

## Prerequisites

Before setting up your bot, ensure you have:

- A Telegram account
- Access to Telegram on your device

## Step-by-Step Setup Instructions

### Step 1: Create Your Telegram Bot

1. Open Telegram and search for **@BotFather**
2. Start a conversation and send the command `/newbot`
3. Follow the prompts to:

   - Choose a name for your bot (this is the display name)
   - Choose a username for your bot (must end in 'bot')

4. BotFather will provide you with an API token like:
   `1234567890:ABCDEFGHijklmnopqrstuvwxyz`
5. Save this token - you'll need it for configuration

### Step 2: Configure Your Bot

1. **Model name** (Required)

   - Select the AI model that will power your bot
   - Available options:
     - **Gemma 3 1B**: Lightweight and fast responses
     - **Deepseek 1.5B**: More advanced capabilities

2. **Telegram API token** (Required)

   - Paste the token you received from BotFather
   - Format: `1234567890:ABCDEFGHijklmnopqrstuvwxyz`

3. **LLM system prompt** (Optional)

   - Define your bot's personality and behavior
   - Examples:
     - "You are a helpful assistant that speaks like a pirate"
     - "You are a coding expert who explains concepts simply"
     - "You are a friendly chatbot that loves to tell jokes"

### Step 3: Start Chatting

1. After deployment, search for your bot's username in Telegram
2. Start a conversation with your bot
3. Send messages and receive AI-powered responses
4. All conversations remain private within the TEE

## Privacy Features

- Your conversations never leave the secure environment
- The AI model runs entirely within the TEE
- No logs or conversation history are stored externally
- Even the app operator cannot access your chats
