export const communicationStats = (com1, com2) => {
    if(com1 == com2){
        return 1;
    }
    else if((com1 == 1 && com2 != 1) || (com2 == 1 && com1 != 1)){
        return 0.3;
    }
    else{
        return 0.8;
    }
}