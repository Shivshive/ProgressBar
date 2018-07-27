// All Dependencies...
var Progress = require('progress');
var fs = require('fs');
var path = require('path');
const chalk = require('chalk');
const art = require("ascii-art");
var readline = require('readline');
var readlineSync = require('readline-sync');
var inquirer = require('inquirer');

// File Process Logo...
art.font("File Processing...", 'Doom', function (rendered) {
    console.log(chalk.magentaBright(rendered));
    takeUser_Input().then((userInputObject) => {
        console.log(chalk.redBright("\n\r--------------------------------------------------------------------------------------------------------------------------------\n\r"));
        fileProcess(userInputObject);
    });
});


// Filter File Records...
function fileProcess(inputs) {

    var outputFile = path.join(__dirname, 'filtered_output.txt');

    if (fs.existsSync(outputFile)) {
        fs.unlink(outputFile, (err) => {
            if (err) console.log(err);
        });
    }

    var filedetails = fs.statSync(inputs.filePath);
    var filesize = filedetails.size;

    var bar = new Progress(chalk.greenBright.bold('Processing') + ' ' + chalk.greenBright(': [ ') + ':bar' + chalk.greenBright(' ]') + ' ' + chalk.yellowBright.bold('[:percent] [:etas]'), {
        total: filesize,
        width: 100,
        complete: chalk.greenBright("="),
        incomplete: chalk.cyanBright(".")
    });

    var previousLine;

    require('readline').createInterface({

        input: require('fs').createReadStream(inputs.filePath)

    }).on('line', function (line) {

        bar.tick(Buffer.byteLength(line, 'utf8'));

        inputs.records.forEach(function (value, index, arry) {

            if (line.indexOf(value) != -1) {

                //Append line to new file...
                fs.appendFileSync(outputFile, line + '\r\n', 'utf8');
            }
        });

        previousLine = line;

    }).on('close', function () {

        bar.update(1);
        console.log(chalk.yellowBright('\r\nFile Filtered.') + chalk.yellowBright.bold('\n\n\rOutput File Generated -- ') + chalk.cyanBright.underline(outputFile));
    });
}

// Take File from user...
function takeUser_Input() {

    console.log(chalk.redBright("\n\r--------------------------------------------------------------------------------------------------------------------------------\n\r"));

    var userInputs = {};

    return new Promise(
        function (resolve, reject) {

            const properties = [
                {
                    name: "filePath",
                    message: chalk.green('Enter File Path > '),
                    type: "input",
                    validate: function (value) {
                        var filPath = value;
                        if (filPath.indexOf('\\') != -1) {
                            if (fs.existsSync(filPath)) {
                                return true
                            }
                            else {
                                return 'File Path Does not exists'
                            }
                        }
                        else {
                            return 'Path is not correct'
                        }

                    }
                },
                {
                    name: "records",
                    message: chalk.green("Enter records to filter > "),
                    type: "input",
                    validate: function (value) {

                        if (value.length) {
                            return true;
                        }
                        else {
                            return 'records value blank'
                        }
                    }
                }
            ]

            inquirer.prompt(properties).then((inObj) => {

                userInputs.filePath = inObj.filePath;
                userInputs.records = [];
                userInputs.records.push(inObj.records);
                resolve(userInputs);
            });
        }
    )
}
