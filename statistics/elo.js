// (abs val of elo1-elo2)/max(elo1,elo2)
export const elo_statistics = (elo1, elo2) => {
    return (1 - (Math.abs(elo1 - elo2) / Math.max(elo1, elo2))).toFixed(4);
    // if(elo >= 0.85){
    //     return 1;
    // }
    // else{
    //     return elo;
    // }
}