public with sharing class PaymentController {

@AuraEnabled
public static Id savePayment(
    String cardNumber,
    String cvv,
    String expiryMonth,
    String expiryYear,
    Id guestId
){

 
    if(String.isBlank(cardNumber) ||
       String.isBlank(cvv) ||
       String.isBlank(expiryMonth) ||
       String.isBlank(expiryYear)){
        throw new AuraHandledException('All payment fields are required');
    }

    if(guestId == null){
        throw new AuraHandledException('GuestId missing');
    }


    Payment_Detail__c payment = new Payment_Detail__c(
        Card_Number__c = cardNumber,
        CVV__c = cvv,
        Expiry_Month__c = expiryMonth,
        Expiry_Year__c = expiryYear,
        Payer_Details__c = guestId
    );

    insert payment;
    payment = [
    SELECT Name
    FROM Payment_Detail__c
    WHERE Id = :payment.Id
];
  
    try{

        Guest_Detail__c guest = [
            SELECT Guest_Email__c, Guest_First_Name__c
            FROM Guest_Detail__c
            WHERE Id = :guestId
            LIMIT 1
        ];

        if(String.isNotBlank(guest.Guest_Email__c)){
             OrgWideEmailAddress owea = [
             SELECT Id FROM OrgWideEmailAddress
             WHERE Address = 'dikshasharma1725@gmail.com'
             LIMIT 1
];
            Messaging.SingleEmailMessage mail =
                new Messaging.SingleEmailMessage();

            mail.setToAddresses(
                new String[]{ guest.Guest_Email__c }
            );

            mail.setSubject('Payment Successful');

            mail.setPlainTextBody(
                'Hi ' + guest.Guest_First_Name__c +
                ',\n\nYour payment is successful.' +
                '\nPayment Code: ' + payment.Name +
                '\n\nThank you for booking with us.'
            );
           mail.setWhatId(guestId); 
              mail.setSaveAsActivity(true);  
              mail.setOrgWideEmailAddressId(owea.Id);

            Messaging.sendEmail(
                new Messaging.SingleEmailMessage[]{ mail }
            );
        }

    }catch(Exception e){
        System.debug('Email failed: ' + e.getMessage());
        
    }

    return payment.Id;
}
}
