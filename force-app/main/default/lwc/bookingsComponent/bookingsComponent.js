import { LightningElement, track } from 'lwc';
import getBookings from '@salesforce/apex/BookingsController.getBookings';
import getConfirmationEmails from '@salesforce/apex/BookingsController.getConfirmationEmails';

export default class BookingsComponent extends LightningElement {

    @track bookings = [];
    @track isLoading = true;

    connectedCallback() {
        const email = localStorage.getItem('loggedUserEmail');
        if (email) {
            Promise.all([
                getBookings({ email }),
                getConfirmationEmails({ email })
            ])
                .then(([bookingResult, emailResult]) => {
                    const emailMap = {};
                    emailResult.forEach(em => {
                        if (!emailMap[em.RelatedToId]) {
                            emailMap[em.RelatedToId] = em;
                        }
                    });
                    this.bookings = bookingResult.map(b => this.mapBooking(b, emailMap[b.Id]));
                    this.isLoading = false;
                })
                .catch(error => {
                    console.error('Error loading bookings:', error);
                    this.isLoading = false;
                });
        } else {
            this.isLoading = false;
        }
    }

    mapBooking(b, emailRecord) {
        const checkIn = b.Check_In_Date__c ? new Date(b.Check_In_Date__c) : null;
        const checkOut = b.Check_Out_Date__c ? new Date(b.Check_Out_Date__c) : null;
        let nights = 0;
        if (checkIn && checkOut) {
            nights = Math.round((checkOut - checkIn) / (1000 * 60 * 60 * 24));
        }

        const perDay = b.Hotel__r ? b.Hotel__r.Per_Day_Cost__c || 0 : 0;
        const totalAmount = perDay * nights;

        const payments = b.Payment_Details__r || [];
        const latestPayment = payments.length > 0 ? payments[0] : null;

        let last4 = '';
        let paymentExpiry = '';
        if (latestPayment) {
            last4 = latestPayment.Name ? latestPayment.Name.slice(-4) : '';
            paymentExpiry = (latestPayment.Expiry_Month__c || '') + ' / ' + (latestPayment.Expiry_Year__c || '');
        }

        return {
            Id: b.Id,
            Hotel__r: b.Hotel__r,
            Check_In_Date__c: b.Check_In_Date__c,
            Check_Out_Date__c: b.Check_Out_Date__c,
            Adults__c: b.Adults__c,
            Children__c: b.Children__c,
            nights: nights,
            totalAmount: totalAmount,
            hasPayment: latestPayment != null,
            last4: last4,
            paymentExpiry: paymentExpiry,
            emailSubject: emailRecord ? emailRecord.Subject : null,
            emailBody: emailRecord ? emailRecord.TextBody : null,
            hasEmail: !!emailRecord,
            showEmail: false,
            emailToggleIcon: '▼'
        };
    }

    get hasBookings() {
        return this.bookings && this.bookings.length > 0;
    }

    toggleEmail(event) {
        const id = event.currentTarget.dataset.id;
        this.bookings = this.bookings.map(b =>
            b.Id === id ? { ...b, showEmail: !b.showEmail, emailToggleIcon: b.showEmail ? '▼' : '▲' } : b
        );
    }
}
