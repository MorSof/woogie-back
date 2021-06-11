function getDaysDiff(date1, date2){
    let timeDiff = Math.abs(date2.getTime() - date1.getTime());
    return Math.floor(timeDiff / (1000 * 3600 * 24));
}

module.exports = getDaysDiff;
