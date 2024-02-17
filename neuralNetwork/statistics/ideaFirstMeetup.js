export const idealFirstMeetupStats = (meet1, meet2) => {
    if(meet1 == meet2){
        return 1;
    }
    else if(Math.abs(meet1 - meet2) <= 2){
        return 0.8;
    }
    else{
        return 0.3;
    }
}