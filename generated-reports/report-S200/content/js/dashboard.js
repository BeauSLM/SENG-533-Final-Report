/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 99.90475585751476, "KoPercent": 0.09524414248523716};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.25163502444599656, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.006045340050377834, 500, 1500, "Look at Product"], "isController": false}, {"data": [0.38973684210526316, 500, 1500, "Add Product to Cart"], "isController": false}, {"data": [0.37174028738690795, 500, 1500, "Logout"], "isController": false}, {"data": [0.01186178442496132, 500, 1500, "List Products with different page"], "isController": false}, {"data": [0.390625, 500, 1500, "Add Product 2 to Cart"], "isController": false}, {"data": [0.42003900536323746, 500, 1500, "Login"], "isController": false}, {"data": [0.009313725490196078, 500, 1500, "List Products"], "isController": false}, {"data": [0.42138364779874216, 500, 1500, "Home"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 15749, 15, 0.09524414248523716, 3003.610641945517, 0, 38573, 1634.0, 6556.0, 8433.5, 13174.5, 65.29084253336264, 3233.162500246152, 13.92465421510242], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Look at Product", 1985, 6, 0.3022670025188917, 5265.681108312347, 0, 31304, 4649.0, 8852.0, 10741.19999999997, 14909.719999999994, 8.245067497403946, 951.6847903686397, 1.7883080218068537], "isController": false}, {"data": ["Add Product to Cart", 1900, 4, 0.21052631578947367, 1499.913684210527, 0, 7433, 1158.0, 2893.600000000006, 3730.749999999999, 4896.97, 7.954250500280492, 75.93761381904498, 1.6510629913842907], "isController": false}, {"data": ["Logout", 1879, 0, 0.0, 1567.3251729643428, 335, 7960, 1158.0, 3349.0, 3756.0, 4923.800000000002, 7.918146841801411, 70.50553017924342, 1.616106142516108], "isController": false}, {"data": ["List Products with different page", 1939, 4, 0.20629190304280556, 4939.381640020626, 0, 25086, 4266.0, 8466.0, 10410.0, 14991.399999999981, 8.070558071390517, 931.1423365207321, 1.8483092318714205], "isController": false}, {"data": ["Add Product 2 to Cart", 1888, 0, 0.0, 1499.4020127118615, 299, 7685, 1158.0, 2669.7000000000035, 3673.0499999999993, 5209.139999999992, 7.9118963407479415, 75.6575087584022, 1.6457362505657342], "isController": false}, {"data": ["Login", 2051, 1, 0.04875670404680644, 1570.9268649439277, 0, 16961, 1155.0, 3067.9999999999986, 4426.199999999999, 6290.560000000003, 8.530442992434482, 80.19320058758574, 1.761632918526159], "isController": false}, {"data": ["List Products", 2040, 0, 0.0, 5790.450000000007, 209, 38573, 5041.5, 9715.6, 11543.499999999998, 16949.21, 8.464519555529737, 981.0536599062887, 1.9425411089350473], "isController": false}, {"data": ["Home", 2067, 0, 0.0, 1748.3434929850025, 84, 31173, 1147.0, 4120.6, 5306.2, 9596.839999999976, 8.582710841122271, 76.42300532163367, 1.7517446931587448], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: a31d78295f75a4edd9760a9f8f4aa8b0-1659331502.us-west-2.elb.amazonaws.com:8080 failed to respond", 15, 100.0, 0.09524414248523716], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 15749, 15, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: a31d78295f75a4edd9760a9f8f4aa8b0-1659331502.us-west-2.elb.amazonaws.com:8080 failed to respond", 15, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Look at Product", 1985, 6, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: a31d78295f75a4edd9760a9f8f4aa8b0-1659331502.us-west-2.elb.amazonaws.com:8080 failed to respond", 6, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Add Product to Cart", 1900, 4, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: a31d78295f75a4edd9760a9f8f4aa8b0-1659331502.us-west-2.elb.amazonaws.com:8080 failed to respond", 4, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["List Products with different page", 1939, 4, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: a31d78295f75a4edd9760a9f8f4aa8b0-1659331502.us-west-2.elb.amazonaws.com:8080 failed to respond", 4, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["Login", 2051, 1, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: a31d78295f75a4edd9760a9f8f4aa8b0-1659331502.us-west-2.elb.amazonaws.com:8080 failed to respond", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
