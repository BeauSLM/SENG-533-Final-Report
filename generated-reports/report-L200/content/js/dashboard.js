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

    var data = {"OkPercent": 99.99356664951107, "KoPercent": 0.006433350488934638};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.40507591353576944, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.16201117318435754, 500, 1500, "Look at Product"], "isController": false}, {"data": [0.5351624933404369, 500, 1500, "Add Product to Cart"], "isController": false}, {"data": [0.5425243770314193, 500, 1500, "Logout"], "isController": false}, {"data": [0.22288531395952257, 500, 1500, "List Products with different page"], "isController": false}, {"data": [0.5364806866952789, 500, 1500, "Add Product 2 to Cart"], "isController": false}, {"data": [0.556930693069307, 500, 1500, "Login"], "isController": false}, {"data": [0.14054726368159204, 500, 1500, "List Products"], "isController": false}, {"data": [0.5585918266863614, 500, 1500, "Home"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 15544, 1, 0.006433350488934638, 1879.8903757076705, 81, 20558, 1120.0, 4472.0, 6240.25, 10010.599999999991, 64.98925486457784, 3244.6534572969713, 13.884076399167148], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Look at Product", 1969, 1, 0.05078720162519045, 3194.357034027423, 205, 19770, 2327.0, 6818.0, 8497.5, 12302.999999999996, 8.251544283427345, 958.2430621508598, 1.7942497378175524], "isController": false}, {"data": ["Add Product to Cart", 1877, 0, 0.0, 1084.2051145444875, 85, 5742, 1035.0, 1685.0000000000007, 3182.8999999999983, 4016.180000000003, 7.8990337676329, 75.5345104029896, 1.6430607348689528], "isController": false}, {"data": ["Logout", 1846, 0, 0.0, 1061.6955579631629, 81, 7939, 1026.0, 1641.0, 2837.649999999994, 4392.3899999999985, 7.767692961527619, 69.16584416328986, 1.5853982704680392], "isController": false}, {"data": ["List Products with different page", 1927, 0, 0.0, 2923.375713544369, 172, 18266, 2052.0, 6431.0, 7954.4, 12582.760000000007, 8.088176655515868, 938.6070022854241, 1.8561733535607705], "isController": false}, {"data": ["Add Product 2 to Cart", 1864, 0, 0.0, 1076.8041845493556, 90, 6623, 1036.0, 1720.5, 3070.75, 4097.299999999998, 7.843467283820744, 75.00315590153588, 1.6315024721228697], "isController": false}, {"data": ["Login", 2020, 0, 0.0, 1063.9485148514866, 83, 9572, 1026.0, 1456.900000000001, 2572.199999999997, 5051.339999999998, 8.462788865986292, 81.50019821569218, 1.7581168933185862], "isController": false}, {"data": ["List Products", 2010, 0, 0.0, 3448.8253731343248, 206, 20558, 2815.5, 6914.9000000000015, 8640.9, 12124.63999999999, 8.410640087370231, 979.2368166289548, 1.9301761919257854], "isController": false}, {"data": ["Home", 2031, 0, 0.0, 1090.3796159527321, 84, 9444, 1016.0, 1396.5999999999992, 3291.3999999999933, 5612.440000000002, 8.509942931845037, 75.77505825445608, 1.7368926491754029], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: a31d78295f75a4edd9760a9f8f4aa8b0-1659331502.us-west-2.elb.amazonaws.com:8080 failed to respond", 1, 100.0, 0.006433350488934638], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 15544, 1, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: a31d78295f75a4edd9760a9f8f4aa8b0-1659331502.us-west-2.elb.amazonaws.com:8080 failed to respond", 1, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Look at Product", 1969, 1, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: a31d78295f75a4edd9760a9f8f4aa8b0-1659331502.us-west-2.elb.amazonaws.com:8080 failed to respond", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
