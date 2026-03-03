import { LightningElement, wire } from 'lwc';
import {NavigationMixin, CurrentPageReference} from 'lightning/navigation';
import {ShowToastEvent} from 'lightning/platformShowToastEvent';    
import getHotels from '@salesforce/apex/HotelListController.getHotels';

export default class HotelListsComponent extends NavigationMixin(LightningElement) {

    city = '';
    type = '';
    hotels = [];
    selectedHotel;
    isLoading = false;
    error;
    guestId = '';

    @wire(CurrentPageReference)
    getStateParameters(pageRef) {
       if(pageRef && pageRef.state){

        this.city = pageRef.state.c__city|| '';
        this.type = pageRef.state.c__type|| '';
        this.guestId = pageRef.state.c__guestId|| '';

        console.log('STATE VALUES => ', this.city, this.type);
        this.loadHotels();

    }
}

get isGuestMissing() {
    return !this.guestId;
}

loadHotels() {
    this.isLoading = true;
    getHotels({city: this.city, type: this.type})
        .then(result => {
            console.log('APEX RESULT => ', result);
             this.hotels = result ? result : [];  
    this.error = undefined;
})
        .catch(err=>{
            this.error = err.body?.message;
        })
        .finally(()=>{
            this.isLoading = false;
        });
    }

    handleSelect(event) {
       const index = event.target.dataset.index;
        this.selectedHotel = this.hotels[index];

        console.log('Selected Hotel:', this.selectedHotel);
    }

   handleConfirm(){

    if(!this.guestId){
        this.showToast('Error','Please fill Guest Form first','error');
        return;
    }
        console.log('Confirm clicked');
        console.log('SelectedHotel:', this.selectedHotel);

        if(!this.selectedHotel){
            this.dispatchEvent(
                new ShowToastEvent({
                    title:'No selection',
                    message:'Please select a hotel.',
                    variant:'warning'
                })
            );
            return;
        }

        this.dispatchEvent(
            new ShowToastEvent({
                title:'Hotel Selected',
                message:this.selectedHotel.Name,
                variant:'success'
            })
        );

        
        this[NavigationMixin.Navigate]({
            type:'standard__navItemPage',
            attributes:{
                apiName:'Payment_Details'
                 },
    state:{
         c__guestId:this.guestId 
            }
        });
    }
     showToast(title, message, variant){
        this.dispatchEvent(
            new ShowToastEvent({
                title: title,
                message: message,
                variant: variant
            })
        );
    }

}
