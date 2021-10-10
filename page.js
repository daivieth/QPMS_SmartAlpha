/**
 * Manage App page to display
 * @param {String} umod - Model name to display
 * @param {String} username - username
 * @param {String} page - page to display
 */
function getAppContent(umod, username, page){
  var vumod = getDataMain(umod,1);
  var output;
  
  //Signal page
  if (page == '' || page == null) {

    if (vumod != '' && vumod != null) { 
      vumod = umod;
    }
    if (umod == vumod){
      output = HtmlService.createHtmlOutput(outputSignalHtmlPage(umod, username));
    }

  }

  return output;
}


/**
 * Return the html output of the signal page
 * @param {String} umod - Model name
 * 
 */
function outputSignalHtmlPage(umod, username){
  return getHtmlHeader() + 
          getHeadTag() +
          getPageStyle() +
          getHeadClosingTag() +
          getBodyTag() +
          getMenuTableHeader(umod, username) +
          getSignalTableBodyHeader() +
          getSignalTableRows(umod) +
          getSignalTableBodyClosingTag() +
          getBodyCloseTag() +
          getHtmlHeaderCloseTag(); 
}

/**
 * Get base url of the app
 */
function getGlobalBaseUrl() {
  return global_main_base_url;
}

/**
 * Return the HTML page header
 */
function getHtmlHeader(){
  return `<!DOCTYPE html>
          <html>`;
}

/**
 * Return the HTML page closing tag
 */
function getHtmlHeaderCloseTag(){
  return '</html>';
}

/**
 * Return the page Head tag
 */
function getHeadTag(){
  return `<head>
              <meta charset="utf-8">
              <title>Assign Project List - Bootdey.com</title>
              <meta name="viewport" content="width=device-width, initial-scale=1">
              <script src="https://code.jquery.com/jquery-1.10.2.min.js"></script>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@4.4.1/dist/css/bootstrap.min.css" rel="stylesheet">
              <script src="https://cdn.jsdelivr.net/npm/bootstrap@4.4.1/dist/js/bootstrap.bundle.min.js"></script>`;
}

/**
 * Return head closing tag
 */
function getHeadClosingTag(){
  return `</head>`;
}

/**
 * Return the page Body opening tag
 */
function getBodyTag(){
  return `<body>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.12.1/css/all.min.css" integrity="sha256-mmgLkCYLUQbXn0B1SRqzHar6dCnv9oZFPEC1g1cwlkk=" crossorigin="anonymous" />

            <div class="container">
            <div class="row">
                <div class="col-12 col-sm-12 col-md-12">
                <div class="card">`;
}

/**
 * Return the page Body closing tag
 */
function getBodyCloseTag(){
  return `        </div>
              </div>
          </div>
          </div>
          </body>`;
}


/**
 * Return the table header
 * Logo
 * Dropdown model selection
 * Button to open the Analytics spreadsheet link
 * @param {String} umod - Model name
 * @param {String} username - username
 */
function getMenuTableHeader(umod, username){
  return `
            <div class="card-header">
              <!-- header section: Logo + Selection box -->
              <img src="https://gcdn.pbrd.co/images/SI9ifqCW0RYC.png?o=1" style="height: 50px;">
              <!-- dropdown -->
              <div class="dropdown show">
                <a class="btn btn-secondary dropdown-toggle" href="#" role="button" id="dropdownMenuLink" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                  `+ umod +`
                </a>

                <div class="dropdown-menu" aria-labelledby="dropdownMenuLink">
                `+ getModelDropdownMenuContent(username) +`
                </div>
              </div>
              <!-- Button Mode -->
              <a href="`+ getMasterURL(umod) +`" target="_blank" type="button" class="btn btn-primary" style="margin-left: 10px;">Analytics</a>

            </div>
            <div class="card-header d-none d-lg-block d-xl-block" style="height: 350px;">
              <!-- performance chart section -->
              <div class="iFrameLoading">
              <iframe width="100%" height="300" seamless frameborder="0" scrolling="no" 
              src="`+ getPerformanceChartUrl(umod) +`">
              </iframe>              
              </div>
            </div>`;
}

/**
 * Open Master URL: from Analytics button
 * 1. umod = Model name
 * @param {String} umod - Model name
 */
function getMasterURL(umod) {
  var dataModel = SpreadsheetApp.openById(global_data_main_id).getSheetByName('Data:Model').getRange('A1:B1000').getValues();
  var masterURL = '';

  for (var i = 0; i < 1000; i++) {
    if (dataModel[i][0] == umod) {
      masterURL = dataModel[i][1];
      break;
    }
  }

  return masterURL;
}

/**
 * Get Performance chart url
 * 1. umod = Model name
 * @param {String} umod - Model name
 */
function getPerformanceChartUrl(umod){
  var dataModel = SpreadsheetApp.openById(global_data_main_id).getSheetByName('Data:Model').getRange('A1:F1000').getValues();
  var chartUrl = '';

  for (var i = 0; i < 1000; i++) {
    if (dataModel[i][0] == umod) {
      chartUrl = dataModel[i][5];
      break;
    }
  }

  return chartUrl;
}

/**
 * Create the dropdown menu
 * @param {String} username - username
 */
function getModelDropdownMenuContent(username){
  var dataModel = SpreadsheetApp.openById(global_data_main_id).getSheetByName('Data:Model').getRange('A1:A1000').getValues();
  var menuOutput = '';

  for (var i = 0; i < 1000; i++) {
    if(dataModel[i][0] != '') {

      menuOutput = menuOutput + '<a class="dropdown-item" href="'+ getGlobalBaseUrl() +'?umod=' + dataModel[i][0] + '&username=' + username +'" target="_top">'+ dataModel[i][0] +'</a>' ;

    }
  }

  return menuOutput;
}

/**
 * Return signal table body header
 */
function getSignalTableBodyHeader(){
  return `
          <div class="card-body">
              <div class="table-responsive" id="proTeamScroll" tabindex="2" style="height: 100%; overflow: hidden; outline: none;">
                  <table class="table table-striped">
                      <thead>
                          <tr>
                              <th>Signal</th>
                              <th>Instrument</th>
                              <th>Date</th>
                              <th>@price</th>
                              <th>Sentiment</th>
                              <th>Projection</th>
                          </tr>
                      </thead>
                      <tbody>`; 
}

/**
 * Return signal table body footer and closing tags
 */
function getSignalTableBodyClosingTag(){
  return `
                    </tbody>
                </table>
            </div>
        </div>`;
}

/**
 * Return rows of signal table 
 * 0 = ticker
 * 1 = max cumul
 * 2 = min cumul
 * 3 = range.%
 * 4 = lower.band
 * 5 = upper.band
 * 6 = pos.avg
 * 7 = neg.avg
 * 8 = trend
 * 9 = strength
 * 10 = velocity
 * 11 = momentum
 * 12 = score
 * 13 = 10d.vol.chg
 * 14 = Sparkline
 * 15 = Projection
 * 16 = Signal
 * 17 = Sentiment
 * 18 = last price
 * @param {String} umod - Model name
 */
function getSignalTableRows(umod){

  var dataModel = SpreadsheetApp.openById(global_data_main_id).getSheetByName('Data:Model').getRange('A1:J1000').getValues();
  var masterID = ''
  var dataGlobalID = '';
  var rows = '';
  for (var i = 0; i < 1000; i++) {
    if (dataModel[i][0] == umod) {
      masterID = dataModel[i][2];
      dataGlobalID = dataModel[i][6];
      break;
    }
  }
  
  var signals = SpreadsheetApp.openById(masterID).getSheetByName('Signals').getRange('B3:T102').getValues();

  for (var r = 0; r <99; r++) {

    if (signals[r][16] != '') {
      rows = rows + `
            <tr>
                <td class="table-img">
                  <button type="button" class="btn `+ getSignalsOrdersTagApp(signals[r][16], 2) +`">` + getSignalsOrdersTagApp(signals[r][16], 1) + `</button>
                </td>
                <td>
                    <h6 class="mb-0 font-13"><strong>`+ signals[r][0] +`</strong></h6>
                    <p class="m-0 font-12">`+ getInstrumentName(signals[r][0], dataGlobalID) +`</p>
                </td>
                <td>`+ getSignalsUpdateDate(masterID) +`</td>
                <td class="text-truncate">
                    <h6 class="mb-0 font-13"><strong>`+ signals[r][18] +`</strong></h6>
                    <p class="m-0 font-12">`+ getSignalEntryCaption(signals[r][0], signals[r][16], masterID) +`</p>
                </td>
                <td class="align-middle">
                    <div class="sentiment-text">`+ getSentimentScorePage(signals[r][0], masterID, 3) +`</div>
                    <div class="progress" data-height="6" style="height: 6px; color: red;">
                        <div class="progress-bar-striped `+ getSentimentScorePage(signals[r][0], masterID, 2) +`" data-width="50%" style="width: `+ getSentimentScorePage(signals[r][0], masterID, 1) +`;"></div>
                    </div>
                </td>
                <td>
                    <div>`+ getProjection(signals[r][15]) +`</div>
                </td>
            </tr>`;
    }

  } 

  return rows;
}

/**
 * Get Sentiment score
 * 
 * Return:
 * 1. score in percentage
 * 2. color class code, bg-positive or bg-negative based on sentiment score
 * 3. text caption
 * 
 * @param {String} ticker - ticker
 * @param {String} masterID - master SS id
 * @param {String} what - Provide 1 for percentage score, 2 for color class, and 3 for text.
 */
function getSentimentScorePage(ticker, masterID, what){

  var dataSignal = SpreadsheetApp.openById(masterID).getSheetByName('Signals').getRange('B3:U102').getValues();
  var selectTicker = '';
  var sentimentScore = 0;
  var output = '';

  for (var i = 0; i < dataSignal.length; i++) {
    selectTicker = dataSignal[i][0];
    if (selectTicker == ticker) {
      sentimentScore = dataSignal[i][19];
      break;
    }
  }

  if (sentimentScore == '' || sentimentScore == null) sentimentScore = 0;
  sentimentScore = parseFloat(sentimentScore);

  if (sentimentScore != 0) {
    if (sentimentScore <= 0.5){
      //negative sentiment
      if (what == 1) {
        output = (1 - sentimentScore)*100;
        output = output.toString() + '%';
      }
      if (what == 2) {
        output = 'bg-negative';
      }
      if (what == 3) {
        output = ((1 - sentimentScore )*100).toFixed(0);
        output = output.toString() + '%' + ' negative'; 
      }
    }
    else {
      //positive sentiment
      if (what == 1) {
        output = sentimentScore * 100;
        output = output.toString() + '%';
      }
      if (what == 2) {
        output = 'bg-positive';
      }
      if (what == 3) {
        output = (sentimentScore*100).toFixed(0);
        output = output.toString() + '%' + ' positive';
      }
    }
  }

  return output;
}

/**
 * Get instrument fullname from ticker
 * Parameter required:
 * 1. ticker
 * 
 * dataInstrument array:
 * 0. Ticker
 * 1. Exchange
 * 2. Instrument Name
 * 3. Industry
 * 4. Country
 * 5. Base
 * 6. Quote
 * 
 * @param {String} ticker - ticker
 * @param {String} dataGlobalID - Global data SS id
 */
function getInstrumentName(ticker, dataGlobalID){
  var dataInstrument = SpreadsheetApp.openById(dataGlobalID).getSheetByName('Data:Instrument').getRange('A2:G1000').getValues();
  var selectTicker = '';
  var colon = '';
  var instrumentName = '';
  var url = '';
  var baseUrl = 'https://www.google.com/finance/quote/';
  var outputString = '';

  for (var i = 0; i < dataInstrument.length; i++) {
    if (dataInstrument[i][1] != '') {colon = ':';} else {colon = '';}
    selectTicker = dataInstrument[i][1] + colon + dataInstrument[i][0];
    if (colon != ''){
      url = baseUrl + dataInstrument[i][0] + colon + dataInstrument[i][1];
    } 
    else { 
      url = baseUrl + dataInstrument[i][5] + '-'+ dataInstrument[i][6];
    }

    if (selectTicker == ticker) {
      instrumentName = dataInstrument[i][2];
      break;
    }
  }
  outputString = '<a href="'+ url +'" target="_blank">' + instrumentName + '<a/>';
  return outputString;
}

/**
 * get caption based on type of signals
 * Parameters required:
 * 1. ticker
 * 2. signal tag
 * 3. master id
 * @param {String} ticker - ticker
 * @param {String} signal - Signal tag
 * @param {String} masterID - Master SS id
 */
function getSignalEntryCaption(ticker, signal, masterID){
  var signalEntryCaption = '';
  var textSignal = getSignalsOrdersTagApp(signal, 3);
  var tradeData = SpreadsheetApp.openById(masterID).getSheetByName('Data:Trades').getRange('A2:E1000').getValues();
  var tradePnl = 0;
  var fontTag = '';
  var fontColorPosPnl = 'color: green;';
  var fontColorNegPnl = 'color: red;';

  for (var i = 0; i < tradeData.length; i++){
    if (tradeData[i][0] == ticker) {

      if (Math.abs(tradeData[i][4]) > Math.abs(tradePnl)) tradeDataPnl = tradeData[i][4];
    }
  }
  tradePnl = parseFloat(tradePnl).toFixed(2)*100;
  if (textSignal == 'longSignal' || textSignal == 'shortSignal') signalEntryCaption = '@market price';
  if (tradePnl != 0) {
    if (tradePnl >= 0) {
      fontTag = '<font style="' + fontColorPosPnl + '">';
    }
    else {
      fontTag = '<font style="' + fontColorNegPnl + '">';
    } 
    if (textSignal == 'exitSignal') signalEntryCaption = fontTag + 'exit profit & loss: ' + tradePnl + '%' + '</font>';
  }

  return signalEntryCaption;
}

/**
 * get a formatted projection
 * @param {String} p - provide the projection tag
 */
function getProjection(p){
  
  var proj = '';

  if (p == '▲') proj = '<font style="color: gray;">▲</font>';
  if (p == '▲▲') proj = '<font style="color: green;">▲▲</font>';
  if (p == '▲▲▲') proj = '<font style="color: mediumseagreen;">▲▲▲</font>';
  if (p == '▼') proj = '<font style="color: red;">▼</font>';

  return proj;
}

/**
 * Get last signal(s) update date
 * MasterID = Master ID of the Master SS
 * @param {String} masterID - Master SS id
 */
function getSignalsUpdateDate(masterID) {

  var outputDate = SpreadsheetApp.openById(masterID).getSheetByName('Settings').getRange('F10').getValue();
  return getDateFormat(outputDate);

}


/**
 * Return page style block
 */
function getPageStyle(){
  return `
        <style type="text/css">
        body{
            background-color: #eee;
            margin-top:20px;
        }

        .card {
            background-color: #fff;
            border-radius: 10px;
            border: none;
            position: relative;
            margin-bottom: 30px;
            box-shadow: 0 0.46875rem 2.1875rem rgba(90,97,105,0.1), 0 0.9375rem 1.40625rem rgba(90,97,105,0.1), 0 0.25rem 0.53125rem rgba(90,97,105,0.12), 0 0.125rem 0.1875rem rgba(90,97,105,0.1);
        }

        .card .card-header {
            border-bottom-color: #f9f9f9;
            line-height: 30px;
            -ms-grid-row-align: center;
            align-self: center;
            width: 100%;
            padding: 10px 25px;
            display: flex;
            align-items: center;
        }

        .card .card-header, .card .card-body, .card .card-footer {
            background-color: transparent;
            padding: 20px 25px;
        }
        .card-header:first-child {
            border-radius: calc(.25rem - 1px) calc(.25rem - 1px) 0 0;
        }
        .card-header {
            padding: .75rem 1.25rem;
            margin-bottom: 0;
            background-color: rgba(0,0,0,.03);
            border-bottom: 1px solid rgba(0,0,0,.125);
        }

        .table:not(.table-sm) thead th {
            border-bottom: none;
            background-color: #e9e9eb;
            color: #666;
            padding-top: 15px;
            padding-bottom: 15px;
        }

        .table .table-img img {
            width: 35px;
            height: 35px;
            border-radius: 50%;
            border: 2px solid #bbbbbb;
            -webkit-box-shadow: 5px 6px 15px 0px rgba(49,47,49,0.5);
            -moz-box-shadow: 5px 6px 15px 0px rgba(49,47,49,0.5);
            -ms-box-shadow: 5px 6px 15px 0px rgba(49,47,49,0.5);
            box-shadow: 5px 6px 15px 0px rgba(49,47,49,0.5);
            text-shadow: 0 0 black;
        }

        .table-img {
            width: 100px;
        }

        .table .team-member-sm {
            width: 32px;
            -webkit-transition: all 0.25s ease;
            -o-transition: all 0.25s ease;
            -moz-transition: all 0.25s ease;
            transition: all 0.25s ease;
        }
        .table .team-member {
            position: relative;
            width: 30px;
            white-space: nowrap;
            border-radius: 1000px;
            vertical-align: bottom;
            display: inline-block;
        }

        .sentiment-text {
            font-size: small;
        }


        .progress-bar {
            display: -ms-flexbox;
            display: -webkit-box;
            display: flex;
            -ms-flex-direction: column;
            -webkit-box-orient: vertical;
            -webkit-box-direction: normal;
            flex-direction: column;
            -ms-flex-pack: center;
            -webkit-box-pack: center;
            justify-content: center;
            overflow: hidden;
            color: #fff;
            text-align: center;
            white-space: nowrap;
            background-color: #007bff;
            -webkit-transition: width .6s ease;
            transition: width .6s ease;
        }

        .bg-positive {
            background-color: #54ca68 !important;
        }

        .bg-negative {
            background-color: #f44336 !important;
        }

        .progress {
            -webkit-box-shadow: 0 0.4rem 0.6rem rgba(0,0,0,0.15);
            box-shadow: 0 0.4rem 0.6rem rgba(0,0,0,0.15);
        }
        .iFrameLoading {
          background:url(https://gcdn.pbrd.co/images/6v7B0QQqB7PX.gif?o=1) center center no-repeat;
        }        
        </style>`;
}