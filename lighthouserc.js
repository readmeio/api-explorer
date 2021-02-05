module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:9966/'],
      startServerCommand: 'npm start',
      startServerReadyPattern: 'Compiled successfully.',
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
      token: process.env.LHCI_TOKEN,
      basicAuth: {
        username: process.env.LHCI_USERNAME,
        password: process.env.LHCI_PASSWORD,
      },
    },
  },
};
