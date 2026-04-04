public with sharing class GuestEntryController {

    @AuraEnabled
    public static Id saveGuest(
     String firstName,
     String lastName,
     String email,
     String phone,
     Id hotelId,
     String checkIn,
     String checkOut,
     Integer adults,
     Integer children
    ){
     Guest_Detail__c g = new Guest_Detail__c();
         g.Guest_First_Name__c = firstName;
         g.Guest_Last_Name__c = lastName;
         g.Guest_Email__c = email;
         g.Guest_Phone__c = phone;
         g.Hotel__c = hotelId;
         if(String.isNotBlank(checkIn))  g.Check_In_Date__c  = Date.valueOf(checkIn);
         if(String.isNotBlank(checkOut)) g.Check_Out_Date__c = Date.valueOf(checkOut);
         g.Adults__c   = adults   != null ? adults   : 1;
         g.Children__c = children != null ? children : 0;
     insert g;
     return g.Id;
    }
}