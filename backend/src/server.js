require("dotenv").config();
const app = require("./app");

const PORT = process.env.PORT || 5000;

const http = require('http');
const socketConfig = require('./utils/socket');

const server = http.createServer(app);

// Khởi tạo Socket.IO instance
socketConfig.init(server);

server.listen(PORT, () => {
    console.log(`Backend listening on http://localhost:${PORT}`);
});
