const buildHTML = require('./buildHTML');

let args = process.argv[2];
let regen = false;

switch (args){
  case "h":
  case "help":
    console.log("use -f or -force for forcing build of everthing");
    break;
  case "f":
  case "force":
    regen = true;
  case "":
  default:
    buildHTML({build: {regen, srcPath: './src', outPath: './gen',}});
}