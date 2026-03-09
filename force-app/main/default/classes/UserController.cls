public with sharing class UserController {

    @AuraEnabled
    public static Id createUser(String firstName, String lastName, String email, String phone, String password){

        User_Account__c user = new User_Account__c();

        user.First_Name__c = firstName;
        user.Last_Name__c = lastName;
        user.Email__c = email;
        user.Phone__c = phone;
        user.Password__c = password;

        insert user;

        return user.Id;
    }

    @AuraEnabled
    public static User_Account__c loginUser(String email, String password){

      List<User_Account__c> users = [
SELECT Id, First_Name__c
FROM User_Account__c
WHERE Email__c = :email
AND Password__c = :password
LIMIT 1
];

if(users.size() > 0){
return users[0];
}

return null;

}
}