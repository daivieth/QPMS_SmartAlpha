/**
 * Sign in: upate info
 * 1. Last-login time
 * @param {string} puser
 */
function setSigninInfo(puser) {

    var timestamp = getDateFormat(Date.now());
    var umodArray = SpreadsheetApp.openById(global_data_main_id).openSheetByName('Data:Main').getRange('A2:K20000').getValues();
    var username = '';
    var userEntryPos = 0;
    var i = 0;

    //get user entry position
    for (i = 0; i < umodArray.length; i++) {   
        username = umodArray[i][1];
        if (username == puser) {
            userEntryPos = i;
            break;
        }
    }
    //update timestamp
    umodArray[i][10] = timestamp;

}

/**
 * Process user signin. Redirect to the corresponding section
 * @param {string} puser 
 */
function userSignin(puser) {

    var output;

    if (username != null) {
        username = username.toString().toLowerCase();
        var vusername = getDataMain(username, 1);
        var umod = getDataMain(username, 8);
        if (vusername != '' && vusername != null) { vusername = vusername.toString().toLowerCase(); }
        if (username == vusername) {
            output = HtmlService.createHtmlOutput(outputSignalHtmlPage(umod));
        }
        else {
            output = HtmlService.createHtmlOutputFromFile('signin-error');
        }
        }
        else {
            output = HtmlService.createHtmlOutputFromFile('index');
        }
    
    return output;

}
