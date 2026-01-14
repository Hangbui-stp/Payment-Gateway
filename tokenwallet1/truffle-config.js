module.exports = {
  networks: {
    development: {              // 🔹 đổi từ ganache -> development
      host: "127.0.0.1",        // Địa chỉ Ganache GUI
      port: 7545,               // Port RPC của Ganache GUI
      network_id: "*",          // Chấp nhận mọi network id
    },
  },

  compilers: {
    solc: {
      version: "0.8.21",
      settings: {
        evmVersion: "paris",    // ép compile theo EVM Paris
        optimizer: {
          enabled: true,
          runs: 200,
        },
      },
    },
  },
};
