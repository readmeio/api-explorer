module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:9966/'],
      startServerCommand: 'npm start',
      startServerReadyPattern: 'started',
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
      serverBaseUrl: 'LHCI_URL',
      token: 'LHCI_TOKEN',
      basicAuth: {
        username: 'LHCI_USERNAME',
        password: 'LHCI_PASSWORD',
      },
    },
  },
};
