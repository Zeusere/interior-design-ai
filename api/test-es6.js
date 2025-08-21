export default function handler(req, res) {
  res.status(200).json({
    success: true,
    message: 'ES6 test working',
    timestamp: new Date().toISOString()
  })
}
