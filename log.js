var log = {};
var color = {
    reset: '\033[0m',

    //text color

    black: '\033[30m',
    red: '\033[31m',
    green: '\033[32m',
    yellow: '\033[33m',
    blue: '\033[34m',
    magenta: '\033[35m',
    cyan: '\033[36m',
    white: '\033[37m',

    //background color

    bgblack: '\033[40m',
    bgred: '\033[41m',
    bggreen: '\033[42m',
    bgyellow: '\033[43m',
    bgblue: '\033[44m',
    bgmagenta: '\033[45m',
    bgcyan: '\033[46m',
    bgwhite: '\033[47m'
};

function time(now) {
    var hrs = now.getHours() + "";
    var min = now.getMinutes()+"";
    var sec = now.getSeconds()+"";
    if(hrs.length !==2) {
        hrs = '0'+hrs;
    }
    if(min.length !==2) {
        min = '0'+min;
    }
    if(sec.length !==2) {
        sec = '0'+sec;
    }
    return color.bgblack+color.red+ hrs + ":" + min + ":" + sec +color.reset+ "|";
}
log.info = (info) => {
    var now = new Date();

    console.info(time(now) + color.blue + color.bgblack + info + "" + color.reset);
};
log.error = (error) => {
    var now = new Date();
    
    console.error(time(now) + color.red + color.bgyellow + error + "" + color.reset);
};
log.warn = (warn) => {
    var now = new Date();
    
    console.warn(time(now) + color.yellow + color.bgblack+warn+color.reset);
};
log.log = (log) => {
    var now = new Date();
    
    console.log(time(now) + log);
};

module.exports = log;