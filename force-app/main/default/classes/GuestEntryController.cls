public with sharing class GuestEntryController {

    @AuraEnabled
    public static Id saveGuest(
     String firstName,
     String lastName,
     String email,
     String phone,
     Id hotelId
    ){
     Guest_Detail__c g = new Guest_Detail__c();
         g.Guest_First_Name__c = firstName;
         g.Guest_Last_Name__c = lastName;
         g.Guest_Email__c = email;
         g.Guest_Phone__c = phone;
         g.Hotel__c = hotelId;
     insert g;
     return g.Id;
    }
}