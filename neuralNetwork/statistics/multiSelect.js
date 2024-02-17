function intersection(array1, array2) {
    let intersection = [];
    var i;
    for (i = 0; i < array1.length; i++) {
        if (array2.includes(array1[i])) {
            intersection.push(array1[i]);
        }
    }
    return intersection.length;
}

function union(array1, array2) {
    let union = [];
    var i;
    for (i = 0; i < array1.length; i++) {
        if (!union.includes(array1[i])) {
            union.push(array1[i]);
        }
    }
    for (i = 0; i < array2.length; i++) {
        if (!union.includes(array2[i])) {
            union.push(array2[i]);
        }
    }
    return union.length;
}

function odds(array1, array2) {
    return (intersection(array1, array2) / union(array1, array2));
}

export const multiSelectionSimilarity = (array1, array2) => {
    const currentOdds = odds(array1, array2);
    if(currentOdds != 1){
        const half = currentOdds * 0.25;
        if(currentOdds + half < 1){
            return (currentOdds + half).toFixed(4);
        }
        return (currentOdds).toFixed(4);
    }
    return currentOdds.toFixed(4);
}