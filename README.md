[![Deploy site](https://github.com/sharknoon/wero-tracker/actions/workflows/deploy-site.yml/badge.svg)](https://github.com/sharknoon/wero-tracker/actions/workflows/deploy-site.yml)
[![Update banks.json](https://github.com/sharknoon/wero-tracker/actions/workflows/update-banks-json.yml/badge.svg)](https://github.com/sharknoon/wero-tracker/actions/workflows/update-banks-json.yml)

# Wero Adoption Tracker

Track the adoption of the European payment provider [Wero](https://wero-wallet.eu) across banks and online-shops.

**🌐 Link: [https://werotracker.eu/](https://werotracker.eu/)**

<img width="1282" height="919" alt="grafik" src="https://github.com/user-attachments/assets/91789dca-ba3e-47c4-9768-08ef6a10fb44" />

In comparison to other payment providers like PayPal, Wero needs to be implemented by each bank in order to work.  
This can make it hard to know whether a bank already supports Wero, has announced its support, or hasn’t publicly stated any plans.

## Featues

- 📈 Show adoption stats
- 🔍 Search for banks and online shops
- ✅ Filter for countries and support status (supported/announced/unsupported)
- 💸 See individual payment features (P2P, eCommerce, POS), not every Wero implementation is equal
- 📱 App availability

## Different levels of support

### P2P, e-commerce, and point-of-sale payments

Wero consists of three main parts: peer-to-peer transfers, e-commerce payments, and point-of-sale payments.  
Currently, point-of-sale payments are not implemented by Wero yet, and e-commerce payments have only just started with selected banks.

Each bank has to implement all three parts of Wero separately; therefore, they do not always support all features Wero has to offer.

### Wero app vs. banking app

Some banks decide to implement Wero using their own banking app. Others use the standalone Wero app provided by Wero.

## Contribution

This project heavily relies on up-to-date informations about the current state of the Wero Adoption of individual banks.

You can help this project in several ways:

- Report missing banks [via an GitHub Issue](https://github.com/sharknoon/wero-tracker/issues/new?template=add-missing-bank.md)
- Report missing, false or oudated data [via an GitHub Issue](https://github.com/sharknoon/wero-tracker/issues/new?template=correct-missing-false-or-outdated-data.md)
- Improve the website or change data directly by [forking it](https://github.com/sharknoon/wero-tracker/fork)

Thank you very much in advance 😀

## Development

### Setup

After cloning the repository, run this command:

```bash
npm install
```

### Adding a new bank or online shop

```bash
npm run add
```

### Updating the data for banks with existing Wero support directly from Wero

```bash
npm run update
```

### Linting for unused assets or missing websites

```bash
npm run lint
```

## Legal

All logos are trademarks of their respective companies. Used here for educational and informational purposes only.
