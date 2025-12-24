

const axios = require("axios");
const fs = require("fs");
const path = require("path");
const QRCode = require("qrcode");
const NodeCache = require("node-cache");







async function makePayment(orderId, amount) {
  const API_URL = "https://app.pakasir.com/api/transactioncreate/qris";
  const payload = {
    project: process.env.PAKASIR_PROJECT,
    order_id: orderId,
    amount: amount,
    api_key: process.env.PAKASIR_APIKEY
  };

  try {
    const response = await axios.post(API_URL, payload, {
      headers: { "Content-Type": "application/json" }
    });
    return response.data;
  } catch (err) {
    console.error(err.response ? err.response.data : err.message);
  }
}



async function cekPayment(orderId, amount) {
  const API_URL = `https://app.pakasir.com/api/transactiondetail?project=${process.env.PAKASIR_PROJECT}&amount=${amount}&order_id=${orderId}&api_key=${process.env.PAKASIR_APIKEY}`;

  try {
    // Karena ini GET, kita cukup panggil axios.get tanpa payload
    const response = await axios.get(API_URL, {
      headers: { "Content-Type": "application/json" }
    });

    return response.data; // ini berisi data JSON dari API
  } catch (err) {
    console.error(err.response ? err.response.data : err.message);
  }
}
















const generateRefId = async (prefix = "INV", length = 8) => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let randomPart = "";
  for (let i = 0; i < length; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  const timestamp = Date.now(); // biar unik
  return `${prefix}${timestamp}${randomPart}`;
}






const createImageQR = async(string, refId) => {
// Inisialisasi cache
const cache = new NodeCache({ stdTTL: 3600 }); 

// Cek folder cache
const cacheDir = path.join(__dirname, "cache");
if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

const filePath = path.join(cacheDir, `${refId}.png`);
// Cek apakah sudah ada di cache memory
const cached = cache.get(refId);
if (cached && fs.existsSync(filePath)) {
console.log("✅ QRIS diambil dari cache:", filePath);
return filePath;
}

try {
    await QRCode.toFile(filePath, string, {
      color: {
        dark: "#000000",
        light: "#FFFFFF"
      },
      width: 300
    });

    cache.set(refId, filePath);
    console.log("✅ QRIS berhasil dibuat:", filePath);
    return filePath;
  } catch (err) {
    console.error("❌ Gagal membuat QRIS:", err);
  }
}




module.exports = {makePayment, createImageQR, cekPayment}