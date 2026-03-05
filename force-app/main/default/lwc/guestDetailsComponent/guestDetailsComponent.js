import { LightningElement, wire} from 'lwc';
import {NavigationMixin, CurrentPageReference} from 'lightning/navigation';
import saveGuest from '@salesforce/apex/GuestEntryController.saveGuest';
import getHotel from '@salesforce/apex/HotelListController.getHotel';


export default class GuestDetailsComponent extends NavigationMixin(LightningElement) {

    firstName='';
    lastName='';
    email='';
    phone='';

    city='';
    hotelType='';

    cityOptions = [];
    hotelOptions = [];

    adults=0;
    children=0;

    checkIn='';
    checkOut='';

    todayDate = new Date().toISOString().split('T')[0];

    dateError='';

    hotelId;
    hotelName='';

@wire(CurrentPageReference)
getStateParameters(pageRef){
    if(pageRef){
        this.hotelId = pageRef.state.c__hotelId;
    }
}
@wire(getHotel, {hotelId:'$hotelId'})
hotelData({data}){

    if(data){
        console.log('Hotel Data => ', data);
        this.city = data.Hotel_City__c;
        this.hotelType = data.Hotel_Type__c;
        this.hotelName = data.Name;
    }
}
  
   

    handleChange(event) {
       
    const field = event.target.dataset.field;
    let value = event.target.value;

  
    if(field === 'adults' || field === 'children'){
        value = value ? parseInt(value, 10) : 0;
    }

  
    if(field === 'checkIn' || field === 'checkOut'){
        value = value || '';
    }

  
    this[field] = value;

    console.log(field + " = " + value);
}

    handleNext(){
        this.dateError = '';
if(!this.firstName || !this.lastName || !this.email || !this.phone){
    this.dateError = 'Please fill all required guest details';
    return;
}
       if(!this.checkIn || !this.checkOut){
        this.dateError = 'Please select both Check-In and Check-Out dates';
        return;
    }

    
    const checkInDate = new Date(this.checkIn);
    const checkOutDate = new Date(this.checkOut);

    if(checkOutDate <= checkInDate){
        this.dateError = 'Check-Out date must be after Check-In date';
        return;
    }

    saveGuest({
        firstName: this.firstName,
        lastName: this.lastName,
        email: this.email,
        phone: this.phone,

    }).then(guestId => {
       
            console.log("Guest Created:", guestId);

            this[NavigationMixin.Navigate]({
                type:'standard__navItemPage',
                attributes:{ apiName:'Payment_Details' },
                state:{
                    c__guestId:guestId,
                    c__hotelId: this.hotelId
                }
            });

        })
        .catch(error=>{
            console.error("Guest Save Error:", error);      
        });
    }
}