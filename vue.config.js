module.exports = {
  publicPath: '/',
  devServer: {
    host: '192.168.1.101',
    proxy: {
      '/api': {
        target: 'https://192.168.1.150:5001',
        changeOrigin: true
      }
    }
  }
}
