const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
let path = require('path');

const app = express();
let mongoose = require('mongoose');

// Kết nối với MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/NNPTUD-C4') 
  .then(() => {
    console.log("Đã kết nối thành công với MongoDB!");
  })
  .catch((err) => {
    console.log("Lỗi kết nối MongoDB: ", err.message);
  });

app.use(cors({ origin: true, credentials: true }));
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/api/v1/roles', require('./routes/roles'));
app.use('/api/v1/auth', require('./routes/auth'));
app.use('/api/v1/users', require('./routes/users'));
app.use('/api/v1/addresses', require('./routes/addresses'));
app.use('/api/v1/upload', require('./routes/upload'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
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
