const zrapi = require("./src/index");

// zrapi.pastegg("Z", )
zrapi.snaptik("https://vt.tiktok.com/khpq9t")
.then(data => console.log(data))
.catch(e => console.log(e))
