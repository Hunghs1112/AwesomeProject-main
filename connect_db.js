const mysql = require('mysql');

// Tạo connection pool với số lượng kết nối tối đa là 10 (có thể điều chỉnh theo nhu cầu)
const pool = mysql.createPool({
  connectionLimit: 10,
  host: '103.255.237.115',
  port: 3306,
  user: 'hotrohoc_mixmylook',
  password: '92O^3FhpP!Od',
  database: 'hotrohoc_mixmylook'
});

// Lắng nghe sự kiện khi có kết nối được cấp phát và trả về
pool.on('acquire', (connection) => {
  console.log(`Kết nối ${connection.threadId} đã được cấp phát.`);
});

pool.on('release', (connection) => {
  console.log(`Kết nối ${connection.threadId} đã được trả lại.`);
});

// Thực hiện truy vấn "keep-alive" định kỳ để duy trì kết nối
setInterval(() => {
  pool.query('SELECT 1', (error, results, fields) => {
    if (error) {
      console.error('Lỗi keep-alive:', error);
    } else {
      console.log('Keep-alive: Kết nối vẫn hoạt động.');
    }
  });
}, 60000); // Mỗi 60 giây gửi một truy vấn keep-alive

module.exports = pool;
