import { config } from "dotenv";
import winston from "winston";

const LogLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4
};

const ENV_LOG_LEVEL = 'debug'
const LogLevel = ENV_LOG_LEVEL || "info"

const logger = winston.createLogger({
  levels: LogLevels,
  level: LogLevel,
  format: winston.format.combine(
    winston.format.errors({stack: true}),
    winston.format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss:SSS",
    }),
    winston.format.printf(
      ({timestamp, level, message, logMetadata, stack}) => {
        return `${timestamp} ${level}: ${logMetadata || ''} ${message} ${stack || "" }`;
      }
    )
  ),
  transports: [new winston.transports.Console()]
})


export default logger;

logger.info("haha")
logger.error("hehe")
logger.warn("kkk")
logger.warn("Thiếu thông tin user", {
  userId: 123,
  endpoint: "/api/login"
});
logger.child({
  logMetadata1: `User: 123`
}) 
  .debug("is requesting task!", {user: 123, logMetadata: `User: 123`})











































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