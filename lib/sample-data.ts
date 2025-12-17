import type { WeroData } from "./types";

export const sampleWeroData: WeroData = {
  lastUpdated: "2024-12-15",
  dataSource: "https://github.com/community/wero-tracker-data",
  countries: [
    {
      code: "DE",
      name: "Germany",
      banks: [
        {
          id: "sparkasse",
          name: "Sparkasse",
          website: "https://www.sparkasse.de",
          overallStatus: "supported",
          statusSources: [
            { label: "Wero Press Release", url: "https://www.wero.eu/press" },
            { label: "Sparkasse News", url: "https://www.sparkasse.de/news" },
          ],
          features: {
            p2p: {
              status: "supported",
              sources: [
                {
                  label: "Official Announcement",
                  url: "https://www.sparkasse.de/wero",
                },
              ],
            },
            onlinePayments: {
              status: "supported",
              sources: [
                { label: "Feature Launch", url: "https://www.wero.eu/online" },
              ],
            },
            localPayments: {
              status: "announced",
              notes: "Expected Q1 2025",
              sources: [
                { label: "Roadmap", url: "https://www.wero.eu/roadmap" },
              ],
            },
          },
          appAvailability: {
            weroApp: {
              status: "supported",
              sources: [
                { label: "App Store", url: "https://apps.apple.com/wero" },
              ],
            },
            bankingApp: {
              status: "supported",
              sources: [
                {
                  label: "Sparkasse App Update",
                  url: "https://www.sparkasse.de/app",
                },
              ],
            },
          },
          lastUpdated: "2024-12-10",
        },
        {
          id: "deutsche-bank",
          name: "Deutsche Bank",
          website: "https://www.deutsche-bank.de",
          overallStatus: "supported",
          statusSources: [
            { label: "Deutsche Bank Press", url: "https://www.db.com/press" },
          ],
          features: {
            p2p: {
              status: "supported",
              sources: [
                { label: "DB Wero Launch", url: "https://www.db.com/wero" },
              ],
            },
            onlinePayments: {
              status: "announced",
              notes: "Coming January 2025",
              sources: [
                { label: "Announcement", url: "https://www.db.com/news/wero" },
              ],
            },
            localPayments: {
              status: "none",
            },
          },
          appAvailability: {
            weroApp: {
              status: "supported",
            },
            bankingApp: {
              status: "supported",
              sources: [{ label: "DB App", url: "https://www.db.com/app" }],
            },
          },
          lastUpdated: "2024-12-08",
        },
        {
          id: "commerzbank",
          name: "Commerzbank",
          website: "https://www.commerzbank.de",
          overallStatus: "announced",
          statusSources: [
            {
              label: "Commerzbank News",
              url: "https://www.commerzbank.de/news",
            },
          ],
          features: {
            p2p: {
              status: "announced",
              notes: "Launch planned for Q1 2025",
              sources: [
                {
                  label: "Press Release",
                  url: "https://www.commerzbank.de/press",
                },
              ],
            },
            onlinePayments: {
              status: "none",
            },
            localPayments: {
              status: "none",
            },
          },
          appAvailability: {
            weroApp: {
              status: "none",
            },
            bankingApp: {
              status: "announced",
              notes: "Integration in development",
            },
          },
          lastUpdated: "2024-11-20",
        },
        {
          id: "dkb",
          name: "DKB",
          website: "https://www.dkb.de",
          overallStatus: "none",
          features: {
            p2p: { status: "none" },
            onlinePayments: { status: "none" },
            localPayments: { status: "none" },
          },
          appAvailability: {
            weroApp: { status: "none" },
            bankingApp: { status: "none" },
          },
          lastUpdated: "2024-12-01",
        },
      ],
    },
    {
      code: "FR",
      name: "France",
      banks: [
        {
          id: "bnp-paribas",
          name: "BNP Paribas",
          website: "https://www.bnpparibas.com",
          overallStatus: "supported",
          statusSources: [
            { label: "BNP Wero", url: "https://www.bnpparibas.com/wero" },
          ],
          features: {
            p2p: {
              status: "supported",
              sources: [
                {
                  label: "Launch News",
                  url: "https://www.bnpparibas.com/news",
                },
              ],
            },
            onlinePayments: {
              status: "supported",
              sources: [
                {
                  label: "E-commerce Integration",
                  url: "https://www.bnpparibas.com/ecom",
                },
              ],
            },
            localPayments: {
              status: "announced",
              notes: "Pilot program active",
            },
          },
          appAvailability: {
            weroApp: { status: "supported" },
            bankingApp: { status: "supported" },
          },
          lastUpdated: "2024-12-12",
        },
        {
          id: "credit-agricole",
          name: "Crédit Agricole",
          website: "https://www.credit-agricole.fr",
          overallStatus: "supported",
          features: {
            p2p: { status: "supported" },
            onlinePayments: { status: "announced", notes: "Q1 2025" },
            localPayments: { status: "none" },
          },
          appAvailability: {
            weroApp: { status: "supported" },
            bankingApp: { status: "supported" },
          },
          lastUpdated: "2024-12-05",
        },
        {
          id: "societe-generale",
          name: "Société Générale",
          website: "https://www.societegenerale.fr",
          overallStatus: "announced",
          statusSources: [
            { label: "SG Press", url: "https://www.societegenerale.fr/press" },
          ],
          features: {
            p2p: { status: "announced", notes: "February 2025" },
            onlinePayments: { status: "none" },
            localPayments: { status: "none" },
          },
          appAvailability: {
            weroApp: { status: "none" },
            bankingApp: { status: "announced" },
          },
          lastUpdated: "2024-11-28",
        },
      ],
    },
    {
      code: "BE",
      name: "Belgium",
      banks: [
        {
          id: "kbc",
          name: "KBC",
          website: "https://www.kbc.be",
          overallStatus: "supported",
          features: {
            p2p: { status: "supported" },
            onlinePayments: { status: "supported" },
            localPayments: { status: "announced" },
          },
          appAvailability: {
            weroApp: { status: "supported" },
            bankingApp: { status: "supported" },
          },
          lastUpdated: "2024-12-10",
        },
        {
          id: "ing-belgium",
          name: "ING Belgium",
          website: "https://www.ing.be",
          overallStatus: "supported",
          features: {
            p2p: { status: "supported" },
            onlinePayments: { status: "announced" },
            localPayments: { status: "none" },
          },
          appAvailability: {
            weroApp: { status: "supported" },
            bankingApp: { status: "supported" },
          },
          lastUpdated: "2024-12-08",
        },
      ],
    },
    {
      code: "NL",
      name: "Netherlands",
      banks: [
        {
          id: "ing-nl",
          name: "ING",
          website: "https://www.ing.nl",
          overallStatus: "announced",
          statusSources: [
            { label: "ING Wero Plans", url: "https://www.ing.nl/wero" },
          ],
          features: {
            p2p: { status: "announced", notes: "Q2 2025" },
            onlinePayments: { status: "none" },
            localPayments: { status: "none" },
          },
          appAvailability: {
            weroApp: { status: "none" },
            bankingApp: { status: "announced" },
          },
          lastUpdated: "2024-11-15",
        },
        {
          id: "rabobank",
          name: "Rabobank",
          website: "https://www.rabobank.nl",
          overallStatus: "announced",
          features: {
            p2p: { status: "announced" },
            onlinePayments: { status: "none" },
            localPayments: { status: "none" },
          },
          appAvailability: {
            weroApp: { status: "none" },
            bankingApp: { status: "announced" },
          },
          lastUpdated: "2024-11-20",
        },
      ],
    },
    {
      code: "ES",
      name: "Spain",
      banks: [
        {
          id: "santander",
          name: "Santander",
          website: "https://www.santander.es",
          overallStatus: "supported",
          features: {
            p2p: { status: "supported" },
            onlinePayments: { status: "supported" },
            localPayments: { status: "announced" },
          },
          appAvailability: {
            weroApp: { status: "supported" },
            bankingApp: { status: "supported" },
          },
          lastUpdated: "2024-12-11",
        },
        {
          id: "bbva",
          name: "BBVA",
          website: "https://www.bbva.es",
          overallStatus: "supported",
          features: {
            p2p: { status: "supported" },
            onlinePayments: { status: "announced" },
            localPayments: { status: "none" },
          },
          appAvailability: {
            weroApp: { status: "supported" },
            bankingApp: { status: "supported" },
          },
          lastUpdated: "2024-12-09",
        },
      ],
    },
  ],
};
