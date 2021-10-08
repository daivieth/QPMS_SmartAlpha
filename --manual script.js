/**
* Edit a cell from each of the signal tab
*  id = '1JRDLr8zbQgh6Py6HfJHujrnTqu1DP5SolcqNu2o6-co'; //master model 
*  id = '1GaluY25euzzojwkKw4-5cQmiJByWqMoPk0UDXryGuWw'; //G8 master
*  id = '1AtYrhMyu4HraF_pyAiMswNFtJRnC2AXpNm2sfaP6wAE'; //ASX200 master
*  id = '1e2gp0t_xzyVS0kIcnXUWJPJbCp-hpTW5WscxNxhfuPc'; //FX Major Trend master
*/
function manuallyUpdateSheet(){

  sourceId  = '1JRDLr8zbQgh6Py6HfJHujrnTqu1DP5SolcqNu2o6-co';
  sourceSheet = SpreadsheetApp.openById(sourceId);

  targetId = '1GaluY25euzzojwkKw4-5cQmiJByWqMoPk0UDXryGuWw';
  targetSheet = SpreadsheetApp.openById(targetId);

  var sourceTab = sourceSheet.getSheetByName('1');
  var targetTab = '';

  sourceTab = sourceSheet.getSheetByName('Data:History');
  targetTab = targetSheet.getSheetByName('Data:History');
  targetTab.getRange('N14').setFormula('=(N8 - N11)+ N17');
  targetTab.getRange('N16').setValue('closed.trade.pnl.%');
  targetTab.getRange('N17').setValue(0);

  /*
  for (i = 2; i <= 100; i++){
    targetTab = targetSheet.getSheetByName(i);
    
    //Do something...
    Logger.log("Processing this: "+ i + ' of this: ' + targetId);
    //targetTab.getRange('F1').setValue(1);
  }
  */

}

/*
Add column to data sheet that contains individual signals
*/
/*
function addColumnsSignalsTab(){
  sheet = SpreadsheetApp.openById(global_qpms_master_id);
  // Input box asks how many columns
  var numCols = 20;

  for (i = 94; i <= 100; i++){
    var tabname = sheet.getSheetByName(i);
    var lastCol = tabname.getLastColumn();
    // That number of columns are appended to the right side of the sheet
    tabname.insertColumnsAfter(lastCol, numCols);
    tabname.getRange('AH1:BL500').setBackground(null);
  }
}
*/

/*
Delete some rows using x and y reference
*/
/*
function deleteRows(){
  sheet = SpreadsheetApp.openById(global_qpms_master_id);
  for (t = 2; t <=100; t++){
    var tabname = sheet.getSheetByName(t);
    tabname.deleteRows(500,500);
    }
}
*/
/*
function setSignalDateTest(){
  var timestamp = getDateFormat(Date.now());
  var savedTimeStamp = getDateFormat(SpreadsheetApp.openById('1GaluY25euzzojwkKw4-5cQmiJByWqMoPk0UDXryGuWw').getSheetByName('Settings').getRange('F10').getValue());
  var testIncorrectDate = getDateFormat('test');
  var diffDate = (timestamp - savedTimeStamp);

  Logger.log(timestamp);
  Logger.log(savedTimeStamp);
  Logger.log(diffDate);
}
*/
