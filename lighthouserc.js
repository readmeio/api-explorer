module.exports = {
  ci: {
    collect: {
      url: ['http://localhost'],
      // startServerCommand: 'npx http-server example/dist --port=3000',
      // startServerReadyPattern: 'Available',
      // startServerReadyTimeout: 20000,
      staticDistDir: './example/dist',
      numberOfRuns: 1,
      // settings: {
      //   emulatedFormFactor: 'desktop',
      //   disableDeviceEmulation: true,
      //   disableCpuThrottling: true,
      //   disableNetworkThrottling: true,
      //   throttlingMethod: 'provided',
      // },
    },
    upload: {
      target: 'lhci',
      serverBaseUrl: process.env.LHCI_URL,
      token: '8a40d86e-1b1d-4e69-b852-4eec88c37ffd', // process.env.LHCI_TOKEN,
      basicAuth: {
        username: process.env.LHCI_USERNAME,
        password: process.env.LHCI_PASSWORD,
      },
    },
  },
};
