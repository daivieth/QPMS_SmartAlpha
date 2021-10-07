
/**
 * Collect sentiment score for each instrument as provided by the index
 * This function is called from getSentimentScore()
 */
function getTabDataSentiment(index){
  var sp = SpreadsheetApp.openById(global_sentiment_sp_id);
  var posScore = 0;
  var negScore = 0;

  var dataRangeX = 'D';
  var dataRangeStartY = 3;
  var dataRangeEndY = 50;
  var tabData = sp.getSheetByName(index);

  var dicPosRange = 'A2:A7000';
  var dicNegRange = 'B2:B7000';
  var dicTabData = sp.getSheetByName('Dictionary');
  var dicMaxData = 0;

  var resultTab = sp.getSheetByName('Score');
  var resultLine = index +1;
  var resultPosCol = 'E';
  var resultNegCol = 'F';
  var resultSentimentCol = 'G';
  var resultSentiment = 0;

  //Copy to array to process data faster
  var newsData = tabData.getRange(dataRangeX + dataRangeStartY + ":" + dataRangeX + dataRangeEndY).getValues();
  var dicPosData = dicTabData.getRange(dicPosRange).getValues();
  var dicNegData = dicTabData.getRange(dicNegRange).getValues();
  
  //get the largest dictionary as the increment loop reference
  if (dicPosData.length >= dicNegData.length)
    dicMaxData = dicPosData.length
  else
    dicMaxData = dicNegData.length;

  for (var i = 0; i <= newsData.length; i++){
    if (newsData[i] != '' && newsData[i] != null) {    
      for (j = 0; j <= dicMaxData; j++){
        //Check Positive data
        if (dicPosData[j] != '' && dicPosData[j] != null ){
          if (newsData[i].toString().toLowerCase().indexOf(dicPosData[j].toString().toLowerCase()) != -1)
            posScore = posScore +1;
        }
        //Check Negative data
        if (dicNegData[j] != '' && dicNegData[j] != null ){
          if (newsData[i].toString().toLowerCase().indexOf(dicNegData[j].toString().toLowerCase()) != -1)
            negScore = negScore +1;
        }
      }
    }
  }
  if (posScore != 0 || negScore != 0){
    resultSentiment = posScore / (posScore + negScore);
    resultTab.getRange(resultPosCol+resultLine).setValue(posScore);
    resultTab.getRange(resultNegCol+resultLine).setValue(negScore);
    resultTab.getRange(resultSentimentCol+resultLine).setValue(resultSentiment.toFixed(2));
  } else {
    resultTab.getRange(resultPosCol+resultLine).setValue('');
    resultTab.getRange(resultNegCol+resultLine).setValue('');
    resultTab.getRange(resultSentimentCol+resultLine).setValue('');
  }
}

/**
 * This function is called from triggerDataUpdate()
 * Call getTabDataSentiment() to collect sentiment score for each individual instrument
 */
function getSentimentScore(force){
  var n = 100;
  var settingsTab = SpreadsheetApp.openById(global_editor_sp_id).getSheetByName('Settings');
  var timeFrom = settingsTab.getRange('F5').getValue() -1;
  var timeTo = settingsTab.getRange('F6').getValue() -1;

  if (force) { Logger.log('get sentiment score...');}

  if ((getTimeNow('hour') >= timeFrom && getTimeNow('hour')< timeTo) || force ){
    for (var i = 1; i <= n; i++){
      getTabDataSentiment(i);
    }
  }
}