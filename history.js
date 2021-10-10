/**
 * Add closed trades to the history tab up to 1,000 records
 * Remove old records: FIFO
 * (1) the trades array
 * (2) the avoidSignal tag
 * (3) the signal tag of the trade
 * Note: Columns: ticker, order, @price,	closedprice,	p/l (%),	Alloc.%,	entry date,	exit date
 * Columns 0 --> 7;
 * 
 * @param {Array} trade - trade record to add to history
 * @param {String} avoidSignal - "avoid signal" tag as a reference
 * @param {String} whatSignal - the signal tag of the trade
 */
function addToHistoryTab(trade, avoidSignal, whatSignal){
  var currentTimestamp = getDateFormat(Date.now());
  var historyData = [];
  var historyDataOutput = [];
  var limitRowHistory = 998;
  var historyDataRange = SpreadsheetApp.openById(global_qpms_master_id).getSheetByName('Data:History').getRange('A2:H1000');
  var row = [];

  if (whatSignal != avoidSignal){
    historyData = historyDataRange.getValues();
    //Create history record from imported trade record
    for (var i = 0; i < trade.length; i++ ){ row.push(trade[i]);}
    row.push(currentTimestamp);
    historyDataOutput.push(row);
    //FIFO history records
    for (var j = 0; j < limitRowHistory; j++){ historyDataOutput.push(historyData[j]);}

    historyDataRange.clearContent();
    historyDataRange.setValues(historyDataOutput);
  }
  
}

/**
 * Compute Performance; capture daily floating pnl
 * @param {Boolean} force - if true, ignore the time constraint and proceed.
 */
function getPortfolioPerformance(force){
  
  var dataHistoryTab = SpreadsheetApp.openById(global_qpms_master_id).getSheetByName('Data:History');
  var settingsTab = SpreadsheetApp.openById(global_qpms_master_id).getSheetByName('Settings');
  var timeFrom = settingsTab.getRange('F5').getValue() +12;
  var timeTo = settingsTab.getRange('F6').getValue() +12;



  if ((getTimeNow('hour') >= timeFrom && getTimeNow('hour')< timeTo) || force ){

    if (force) { Logger.log('Calculating portfolio performance...');}

    var portfTag = dataHistoryTab.getRange('N2');
    var calcPortfTag = portfTag.getValue();
    
    if (calcPortfTag == 'No'){

      //Capture the existing
      var performanceTableRange = dataHistoryTab.getRange('K2:M1000')
      var inputPerformanceTable = performanceTableRange.getValues();
      var outputPerformanceTable = [];
      var row =[];
      var limitPerfHistory = 998;
      var benchmark1Dperf = dataHistoryTab.getRange('N5').getValue();
      //get previous session performance
      var systemPrevPerformance = inputPerformanceTable[0][1];
      var benchmarkPrevPerformance = inputPerformanceTable[0][2];
      if (systemPrevPerformance == '') { systemPrevPerformance = 0;}
      if (benchmarkPrevPerformance == '') { benchmarkPrevPerformance = 0;}
      //Get today's performance
      var currentTimestamp = getDateFormat(Date.now());
      var portfolioChangePct = dataHistoryTab.getRange('N14').getValue();
      if (portfolioChangePct == '' || portfolioChangePct == null) {portfolioChangePct = 0;} 
      var systemPerformance = parseFloat(portfolioChangePct) + parseFloat(systemPrevPerformance);
      var benchmarkPerformance = parseFloat(benchmark1Dperf) + parseFloat(benchmarkPrevPerformance);
      row.push(currentTimestamp);
      row.push(systemPerformance);
      row.push(benchmarkPerformance);
      outputPerformanceTable.push(row);
      //FIFO performance records
      for (var j = 0; j < limitPerfHistory; j++){ outputPerformanceTable.push(inputPerformanceTable[j]);}
      performanceTableRange.clearContent();
      performanceTableRange.setValues(outputPerformanceTable);
      //Update performance table
      updatePerfTable();

      //Flag to yes after completion of the process
      portfTag.setValue('Yes');
    }

  }
}

/**
 * get benchmark specified in the settings
 */
function getBenchmark(){
  var settingsTab = SpreadsheetApp.openById(global_editor_sp_id).getSheetByName('Settings');
  var dataHistoryTab = SpreadsheetApp.openById(global_qpms_master_id).getSheetByName('Data:History');

  //Collect the benchmark specified in the settings
  var benchmark = settingsTab.getRange('F9').getValue();

  //Update benchmark in the data history tab
  dataHistoryTab.getRange('N5').setFormula('=IFERROR((GOOGLEFINANCE("'+ benchmark +'","changepct"))/100,0)');
}

/**
 * Update performance table
 */
function updatePerfTable(){

  //collect performance data
  var startCol = 'K';
  var endCol = 'M';
  var startRow = 2;
  var endRow = 1000;

  var perfData = SpreadsheetApp.openById(global_qpms_master_id).getSheetByName('Data:History').getRange(startCol+startRow + ':' + endCol+endRow).getValues();
  updatePerfTableFor('system', perfData);
  updatePerfTableFor('benchmark', perfData);

}

/**
 * update benchmark performance table
 * what = 'system', 'benchmark'
 * @param {string} what - provide which dataset to update, "system", "benchmark"
 * @param {Array} perfData - 
 */
function updatePerfTableFor(what, perfData){

  var p1W = 0; //7 rows
  var p1M = 0; //20 rows
  var p3M = 0; //60 rows
  var p1Y = 0; //240 rows

  var col = 1;
  var benchmark1W = SpreadsheetApp.openById(global_qpms_master_id).getSheetByName('Data:History').getRange('Q3');
  var benchmark1M = SpreadsheetApp.openById(global_qpms_master_id).getSheetByName('Data:History').getRange('R3');
  var benchmark3M = SpreadsheetApp.openById(global_qpms_master_id).getSheetByName('Data:History').getRange('S3');
  var benchmark1Y = SpreadsheetApp.openById(global_qpms_master_id).getSheetByName('Data:History').getRange('T3');

  var system1W = SpreadsheetApp.openById(global_qpms_master_id).getSheetByName('Data:History').getRange('Q2');
  var system1M = SpreadsheetApp.openById(global_qpms_master_id).getSheetByName('Data:History').getRange('R2');
  var system3M = SpreadsheetApp.openById(global_qpms_master_id).getSheetByName('Data:History').getRange('S2');
  var system1Y = SpreadsheetApp.openById(global_qpms_master_id).getSheetByName('Data:History').getRange('T2');
  

  if (what == 'benchmark') { col = 2; }

  var lastPerfValue = perfData[0][col];
  var selectPerfValue = 0;
  var lastnonBlankPerfValue = 0;

  for (var i = 0; i < perfData.length; i++){

    if (perfData[i][col] != '') {
      selectPerfValue = perfData[i][col];
    } 
    else {
      selectPerfValue = 0;
    }

    if (i == 5) {
      if (selectPerfValue != 0) {
        p1W = (lastPerfValue - selectPerfValue);
      }
    }
    if (i == 20) {
      if (selectPerfValue != 0) {
        p1M = (lastPerfValue - selectPerfValue);
      }
    }      
    if (i == 60) {
      if (selectPerfValue != 0) {
        p3M = (lastPerfValue - selectPerfValue);
      }
    }          
    if (i == 240) {
      if (selectPerfValue != 0) {
        p1Y = (lastPerfValue - selectPerfValue);
      }
    }
    if (i > 240) break;       
  }

  if (p1W == 0 ) { p1W = lastPerfValue; }
  

  if (what == 'benchmark') {
    benchmark1W.setValue(parseFloat(p1W));
    benchmark1M.setValue(parseFloat(p1M));
    benchmark3M.setValue(parseFloat(p3M));
    benchmark1Y.setValue(parseFloat(p1Y));
  }
  else {
    system1W.setValue(parseFloat(p1W));
    system1M.setValue(parseFloat(p1M));
    system3M.setValue(parseFloat(p3M));
    system1Y.setValue(parseFloat(p1Y));    
  }

}

/**
 * Get today's trades portfolio performance
 * Return total trades performance
 */
function getTodayTradesPortfPerf(){
  
  var dataTrade = SpreadsheetApp.openById(global_qpms_master_id).getSheetByName('Data:Trades');
  var perfCol = 'H';
  var perfStartRow = 2;
  var perfEndRow = 1000;
  var totalPerf = 0;

  for (var i = perfStartRow; i <= perfEndRow; i++) {
    totalPerf = totalPerf + dataTrade.getRange(perfCol + i).getValue();
  }
  return totalPerf;
  
}
