export const appPurposeStats = (userOnePurpose, userTwoPurpose) => {
    if(userOnePurpose == userTwoPurpose){
        return 1;
    }
    else if((userOnePurpose == 1 && userTwoPurpose == 2) || (userTwoPurpose == 1 && userOnePurpose == 2)){
        return 0.66;
    }
    else if((userOnePurpose == 1 && userTwoPurpose == 3) || (userTwoPurpose == 1 && userOnePurpose == 3)){
        return 0.33;
    }
    else if((userOnePurpose == 2 && userTwoPurpose == 3) || (userTwoPurpose == 2 && userOnePurpose == 3)){
        return 0;
    }
    else if((userOnePurpose == 2 && userTwoPurpose == 4) || (userTwoPurpose == 2 && userOnePurpose == 4)){
        return 0;
    }
    else if((userOnePurpose == 5 && userTwoPurpose != 5) || (userTwoPurpose == 5 && userOnePurpose != 5)){
        return 0.25;
    }
    else{
        return 0.33;
    }
}