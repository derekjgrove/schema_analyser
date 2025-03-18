const schemaAnalyzerOutput = require('./input/schema.json')
const fs = require('fs');


if (schemaAnalyzerOutput.length === 0) {
    console.log("No schema found.\n");
    return;
}

var dbs = {}
for (var schema of schemaAnalyzerOutput) {

    if (!dbs[schema.databaseName]) {
        dbs[schema.databaseName] = ""
    }
    var rowOut = ""
    var row = []
    var prevField = ""
    for (var fieldAnalysis of schema.analysis) {
        if (fieldAnalysis.path === prevField) {
            if (fieldAnalysis.fieldType === "Null") {
                row[3] += " NULL"
            } else if (fieldAnalysis.fieldType === "Undefined") {
                row[3] += " UNDEFINED"
            } else {
                if (row[0] === "Undefined") {
                    row[2] = fieldAnalysis.fieldType
                    row[3] += " UNDEFINED"
                } else if (row[0] === "Null") {
                    row[0] = fieldAnalysis.fieldType
                    row[3] += " NULL"
                } else {
                    row[0] += `|${fieldAnalysis.fieldType}`
                }
            }
        } else {
            if (row.length > 0) {
                row[3] = '"' + row[3] + '"'
                rowOut += "    " + row.join(" ") + "\n"
            }
            prevField = fieldAnalysis.path
            row[0] = fieldAnalysis.fieldType
            row[1] = fieldAnalysis.path
            row[2] = fieldAnalysis.path === "_id" ? "PK" : ""
            row[3] = ""
        }
    }
    if (row.length > 0) {
        row[3] = '"' + row[3] + '"'
        rowOut += "    " + row.join(" ")
    }
    dbs[schema.databaseName] += "\n  " + schema.collectionName + " {\n" + rowOut + "\n  }" 
}

for (var db in dbs) {
    var logFile = fs.createWriteStream(`output/${db}-output.log`, { flags: 'w' });
    logFile.write("erDiagram" + dbs[db]);
    console.log("erDiagram" + dbs[db])
    console.log("-----------------------------------------------------------------------")
}