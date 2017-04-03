import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Injectable()
export class ViewLogService {
    
    constructor () {}

    private hours = {
        totalHours: 0,
        dayHours: 0,
        nvsHours: 0,
        nvgHours: 0,
        nvdHours: 0,
        hoodHours: 0,
        nightHours: 0,
        weatherHours: 0,
        simHours: 0
    }
    

    pullHours () {
        //ADD LOGIC to pull hours from DB, set to above values;
        console.log('DB Queried!');
        this.hours.totalHours = 30;
    }

    //Getter function for all of the hours pulled from the database
    pushHours () {
        return this.hours;
    }
}