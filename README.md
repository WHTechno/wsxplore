# Winsnip Explorer 🚀

Winsnip Explorer is a modular multichain blockchain explorer designed to support various Cosmos SDK networks. This explorer allows you to add new chains by simply editing JSON configuration files without needing to modify the frontend code.

![Winsnip Explorer](https://pbs.twimg.com/profile_images/1905206975048425472/ywz3Yoc7.jpg)

## ✨ Key Features

- 🔗 **Multi-Chain Support** - Support for various Cosmos SDK networks
- 📊 **Real-time Data** - Real-time blockchain data from RPC and REST endpoints
- 👥 **Validator Information** - Complete validator information with Keybase avatars
- 📈 **Dashboard Analytics** - Comprehensive network statistics
- 🌙 **Dark Mode** - Beautiful interface with dark mode
- 📱 **Responsive Design** - Optimized for desktop and mobile
- 🎨 **Aurora Background** - Attractive background animations

## 🏗️ Project Structure

```
src/
├── config/
│   └── chains/
│       ├── mainnet.json    # Mainnet network configuration
│       └── testnet.json    # Testnet network configuration
├── components/
├── pages/
├── services/
└── types/
```

## 🔧 How to Add a New Chain

### 1. Determine Network Type

Choose whether the chain to be added is:
- **Mainnet**: Main production network
- **Testnet**: Testing network

### 2. Edit Configuration File

#### For Mainnet:
Edit file `src/config/chains/mainnet.json`

#### For Testnet:
Edit file `src/config/chains/testnet.json`

### 3. Chain Configuration Format

Add a new chain object with the following format:

```json
{
  "chainId": "unique-chain-id",
  "chainName": "Chain Display Name",
  "rpc": "https://rpc-endpoint.com",
  "rest": "https://api-endpoint.com",
  "logo": "https://chain-logo-url.com/logo.jpg"
}
```

#### Field Explanations:

| Field | Description | Example |
|-------|-------------|---------|
| `chainId` | Unique chain ID from genesis file | `"cosmoshub-4"` |
| `chainName` | Name displayed in UI | `"Cosmos Hub"` |
| `rpc` | RPC endpoint for blockchain queries | `"https://rpc.cosmos.network"` |
| `rest` | REST API endpoint (LCD) | `"https://api.cosmos.network"` |
| `logo` | Chain logo image URL | `"https://example.com/logo.jpg"` |

### 4. Configuration Examples

#### Mainnet (src/config/chains/mainnet.json):
```json
[
  {
    "chainId": "cosmoshub-4",
    "chainName": "Cosmos Hub",
    "rpc": "https://rpc.cosmos.network",
    "rest": "https://api.cosmos.network",
    "logo": "https://raw.githubusercontent.com/cosmos/chain-registry/master/cosmoshub/images/atom.png"
  },
  {
    "chainId": "axone-1",
    "chainName": "Axone Mainnet",
    "rpc": "https://axone-rpc.nodesync.top",
    "rest": "https://axone-api.nodesync.top",
    "logo": "https://pbs.twimg.com/profile_images/1841523650043772928/EeZIYE7B.jpg"
  }
]
```

#### Testnet (src/config/chains/testnet.json):
```json
[
  {
    "chainId": "theta-testnet-001",
    "chainName": "Cosmos Hub Testnet",
    "rpc": "https://rpc.testnet.cosmos.network",
    "rest": "https://api.testnet.cosmos.network",
    "logo": "https://raw.githubusercontent.com/cosmos/chain-registry/master/cosmoshub/images/atom.png"
  },
  {
    "chainId": "oro_1336-1",
    "chainName": "KiiChain Testnet",
    "rpc": "https://rpc.uno.sentry.testnet.v3.kiivalidator.com",
    "rest": "https://lcd.uno.sentry.testnet.v3.kiivalidator.com",
    "logo": "https://pbs.twimg.com/profile_images/1800553180083666944/zZe128CW.jpg"
  }
]
```

## 🔍 Finding Endpoints

### RPC Endpoints
RPC endpoints typically use port `:26657` and can be tested with:
```bash
curl https://rpc-endpoint.com/status
```

### REST/LCD Endpoints  
REST endpoints typically use port `:1317` and can be tested with:
```bash
curl https://api-endpoint.com/cosmos/base/tendermint/v1beta1/node_info
```

### Reliable Endpoint Sources:

1. **Chain Registry**: https://github.com/cosmos/chain-registry
2. **Polkachu**: https://polkachu.com/
3. **Stakely**: https://stakely.io/
4. **AllNodes**: https://www.allnodes.com/
5. **Official chain documentation**

## ✅ Validation and Testing

### 1. Verify Endpoints

Ensure endpoints are accessible:

```bash
# Test RPC
curl https://your-rpc-endpoint.com/status

# Test REST
curl https://your-rest-endpoint.com/cosmos/base/tendermint/v1beta1/node_info
```

### 2. Test in Explorer

1. Restart development server:
   ```bash
   npm run dev
   ```

2. Open browser and select the new chain from dropdown

3. Verify data appears in:
   - Dashboard (validator statistics)
   - Validators page (validator list)
   - Transactions page (recent transactions)

### 3. Validation Checklist

- [ ] Chain appears in dropdown selector
- [ ] Dashboard displays validator statistics
- [ ] Validators page shows validator list
- [ ] Validator avatars from Keybase appear (if available)
- [ ] Transactions page displays transactions
- [ ] No errors in browser console

## 🚀 Deployment

### Vercel Deployment

1. Commit changes to Git:
   ```bash
   git add .
   git commit -m "Add new chain: [Chain Name]"
   git push
   ```

2. Vercel will automatically deploy changes

3. Verify on production URL

### Environment Variables

No additional environment variables are required to add new chains. All configuration is in JSON files.

## 🔧 Troubleshooting

### Chain Not Appearing
- Ensure JSON syntax is valid
- Restart development server
- Check browser console for errors

### Data Not Loading
- Verify RPC/REST endpoints with curl
- Check CORS policy on endpoints
- Ensure endpoints support HTTPS

### CORS Errors
- Use public endpoints that support CORS
- Or set up proxy server if needed

## 📋 New Chain Template

Copy this template to add a new chain:

```json
{
  "chainId": "your-chain-id",
  "chainName": "Your Chain Name",
  "rpc": "https://your-rpc-endpoint.com",
  "rest": "https://your-rest-endpoint.com",
  "logo": "https://your-logo-url.com/logo.png"
}
```

## 🤝 Contributing

1. Fork the repository
2. Add new chain in the appropriate JSON file
3. Test locally
4. Submit Pull Request with description of the added chain

## 📞 Support

If you encounter issues or need help:
- Create an issue on the GitHub repository
- Include chain information and error details
- Make sure you've followed all steps in this documentation

---

## Development Setup

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

### How to run locally:

```sh
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to the project directory
cd <YOUR_PROJECT_NAME>

# Install dependencies
npm i

# Start development server
npm run dev
```

### END

