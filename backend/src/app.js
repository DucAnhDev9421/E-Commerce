const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
let path = require('path');
require('dotenv').config();

const app = express();
let mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log(`Đã kết nối thành công với MongoDB: ${mongoose.connection.name}`);
  })
  .catch((err) => {
    console.log("Lỗi kết nối MongoDB: ", err.message);
  });

app.use(cors({ origin: true, credentials: true }));
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());

// Cấu hình thư mục tĩnh (public và uploads)
const uploadDir = path.resolve(__dirname, '..', 'uploads');
const fs = require('fs');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

app.use(express.static(path.resolve(__dirname, 'public')));
app.use('/uploads', express.static(uploadDir));

// Routes API
app.use('/api/v1/roles', require('./routes/roles'));
app.use('/api/v1/auth', require('./routes/auth'));
app.use('/api/v1/users', require('./routes/users'));
app.use('/api/v1/addresses', require('./routes/addresses'));
app.use('/api/v1/categories', require('./routes/categories'));
app.use('/api/v1/products', require('./routes/products'));
app.use('/api/v1/product-images', require('./routes/productImages'));
app.use('/api/v1/carts', require('./routes/carts'));
app.use('/api/v1/orders', require('./routes/orders'));
app.use('/api/v1/order-items', require('./routes/orderItems'));
app.use('/api/v1/payments', require('./routes/payments'));
app.use('/api/v1/upload', require('./routes/upload'));

app.get("/api/health", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Backend is running",
    data: {
      timestamp: new Date().toISOString(),
    },
  });
});

app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: "Route not found",
    data: null,
  });
});

app.use((err, req, res, next) => {
  return res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
    data: null,
  });
});

module.exports = app;