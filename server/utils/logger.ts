

















































//--------------------------------------------------------------------------------------
// import fs from 'fs';
// import path from 'path';

// // Đường dẫn tới thư mục log và file log
// const logDir = path.join(__dirname, '../log'); // Thư mục lưu log
// const logFile = path.join(logDir, 'server.log'); // File log chính

// // Đảm bảo thư mục log tồn tại, nếu chưa có thì tạo mới
// if (!fs.existsSync(logDir)) {
//   fs.mkdirSync(logDir);
// }

// // Hàm ghi log vào file với định dạng thời gian, mức log và nội dung
// function writeLog(level: string, message: string) {
//   const time = new Date().toISOString(); // Lấy thời gian hiện tại
//   const logMsg = `[${time}] [${level}] ${message}\n`;
//   fs.appendFileSync(logFile, logMsg, { encoding: 'utf8' }); // Ghi vào file log
// }

// // Đối tượng logger hỗ trợ log ra console và file với 3 mức: info, warn, error
// export const logger = {
//   info: (msg: string) => {
//     console.log(msg); // In ra console
//     writeLog('INFO', msg); // Ghi vào file log
//   },
//   warn: (msg: string) => {
//     console.warn(msg); // In ra console với màu vàng
//     writeLog('WARN', msg); // Ghi vào file log
//   },
//   error: (msg: string) => {
//     console.error(msg); // In ra console với màu đỏ
//     writeLog('ERROR', msg); // Ghi vào file log
//   }
// }; 