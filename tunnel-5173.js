const localtunnel = require('localtunnel')

async function main(){
  const port = process.argv[2] || 5173
  try {
    const tunnel = await localtunnel({ port: Number(port) })
    console.log('LOCALTUNNEL_URL=' + tunnel.url)
    tunnel.on('close', () => console.log('tunnel closed'))
  } catch (err) {
    console.error('tunnel error', err)
    process.exit(1)
  }
}

main()
