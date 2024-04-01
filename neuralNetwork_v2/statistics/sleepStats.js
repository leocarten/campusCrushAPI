export const sleepSchedule = (sleep1, sleep2) => {
    if(sleep1 == sleep2){
        return 1;
    }
    else if((sleep1 == 1 && sleep2 == 2) || (sleep1 == 2 && sleep2 == 1)){
        return 0.2;
    }
    if((sleep1 == 3 && sleep2 != 4) || (sleep1 == 4 && sleep2 != 3)){
        return 0.5;
    }
    else{
        return 0.25;
    }
}