// =========================
// 1️⃣ Import các thư viện
// =========================
const bip39 = require('bip39');
const hdkey = require('hdkey');
const ethUtil = require('ethereumjs-util');
const ethTx = require('ethereumjs-tx');
const express = require('express');
const Web3 = require('web3');

// =========================
// 2️⃣ Kết nối tới Ganache (Blockchain local)
// =========================
const web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:7545"));

// Kiểm tra kết nối
web3.eth.getBlockNumber()
  .then(num => console.log("Đã kết nối Ganache. Block hiện tại:", num))
  .catch(err => console.error("Lỗi kết nối Ganache:", err));

// =========================
// 3️⃣ Khởi tạo ứng dụng Express
// =========================
const app = express();

// =========================
// 4️⃣ Middleware CORS (cho phép frontend truy cập API này)
// =========================
app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});

// =========================
// 5️⃣ Cấu hình cổng chạy server
// =========================
var server = app.listen(process.env.PORT || 5000, function () {
  var port = server.address().port;
  console.log("Server đang chạy trên cổng:", port);
});

// =========================
// 6️⃣ Biến toàn cục lưu chỉ số path
// =========================
var pathid = 0;

// =========================
// 7️⃣ API tạo địa chỉ ví mới
// =========================
app.get("/api/getMAddress", function (req, res) {
  //  Giữ nguyên mnemonic này cho đồng bộ với mwallet
  const mnemonic = "dove vague inherit hazard rubber abandon corn crowd awake manual unique cry";
  console.log("Mnemonic:", mnemonic);

  var sendResponseObject = {};
  var address;

  (async function main() {
    try {
      // Tạo seed từ mnemonic
      const seed = await bip39.mnemonicToSeed(mnemonic);

      // Tạo root node từ seed
      const root = hdkey.fromMasterSeed(seed);

      // Derive theo HD path
      var path = "m/44'/60'/0'/0/" + pathid;
      const addrNode = root.derive(path);

      // FIX QUAN TRỌNG: thêm "0x" trước khi checksum
      const pubKey = ethUtil.privateToPublic(addrNode._privateKey);
      const addr = ethUtil.publicToAddress(pubKey).toString('hex');
      address = ethUtil.toChecksumAddress("0x" + addr);

      console.log(`Address [${pathid}]: ${address}`);

      // Kiểm tra balance thực trên blockchain
      const balanceWei = await web3.eth.getBalance(address);
      const balanceEth = web3.utils.fromWei(balanceWei, 'ether');
      console.log(`Balance hiện tại: ${balanceEth} ETH`);

      // Gửi địa chỉ và balance về frontend
      sendResponseObject['MAddress'] = address;
      sendResponseObject['Balance'] = balanceEth;

      res.json(sendResponseObject);

      // Tăng pathid cho lần sau
      pathid = (pathid + 1) % 100;

    } catch (error) {
      console.error("Lỗi khi tạo địa chỉ:", error);
      res.status(500).send("Đã xảy ra lỗi khi tạo địa chỉ ví");
    }
  })();
});
