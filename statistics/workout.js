export const workoutStats = (workout1, workout2) => {
    if(workout1 == workout2){
        return 1;
    }
    else if((workout1 == 1 && workout2 == 2) || (workout1 == 2 && workout2 == 1)){
        return 0.75;
    }
    else if((workout1 == 1 && workout2 == 3) || (workout1 == 3 && workout2 == 1)){
        return 0.57;
    }
    else if((workout1 == 2 && workout2 == 3) || (workout1 == 3 && workout2 == 2)){
        return 0.57;
    }
    else if((workout1 == 4 && workout2 == 3) || (workout1 == 3 && workout2 == 4)){
        return 0.3;
    }
    else if((workout1 == 4 && workout2 != 3) || (workout1 == 3 && workout2 != 4)){
        return 0.25;
    }
    else{
        return 0.1;
    }
}