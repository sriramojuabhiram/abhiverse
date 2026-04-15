const fs = require('fs');
try {
  const data = fs.readFileSync('public/models/astronaut.glb');
  const jsonLen = data.readUInt32LE(12);
  const json = JSON.parse(data.toString('utf8', 20, 20 + jsonLen));
  const names = json.nodes.map(n => n.name).filter(Boolean);
  
  const relevant = names.filter(n => n.match(/arm|leg|hand|foot|head|neck|spine|bone/i));
  console.log("Found bone names:", relevant);
} catch (e) {
  console.error("Error:", e.message);
}
