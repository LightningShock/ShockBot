var fs = require("fs");
var args = process.argv.slice(2);
if(args[1] === undefined) {
    console.log("Please add token while running");
    console.log("Example: npm token your_token_here");
    process.exit(1);
} 
fs.writeFile("./token.json",JSON.stringify({token:args[1]}),null,(err) => {
    if(err) {
        console.log("Error. Do you have write permission?");
        process.exit(1);
    }
    process.stdout.write('\033c');
    console.log("succesfully wrote "+args[1]+" to token.json");
});
