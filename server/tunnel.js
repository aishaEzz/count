const localtunnel = require('localtunnel')

;(async () => {
  try{
    const tunnel = await localtunnel({ port: 5174 })
    console.log('LOCALTUNNEL_URL=' + tunnel.url)
    tunnel.on('close', () => console.log('tunnel closed'))
  }catch(err){
    console.error('tunnel error', err)
    process.exit(1)
  }
})()
