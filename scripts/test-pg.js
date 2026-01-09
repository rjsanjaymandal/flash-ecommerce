
try {
    console.log('Requiring pg...')
    const pg = require('pg')
    console.log('pg loaded:', typeof pg)
    const { Client } = pg
    console.log('Client available:', typeof Client)
} catch (e) {
    console.error('Failed to load pg:', e)
}
