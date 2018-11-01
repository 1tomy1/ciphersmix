var dict = {
    "a": 0, "b": 1, "c": 2, "č": 3, "d": 4, "e": 5, "f": 6, "g": 7, "h": 8, "i": 9,
    "j": 10, "k": 11, "l": 12, "m": 13, "n": 14, "o": 15, "p": 16, "r": 17, "s": 18,
    "š": 19, "t": 20, "u": 21, "v": 22, "z": 23, "ž": 24, ".": 25, ",": 26, "!": 27,
    " ": 28
};

function makeid() {
    var text = "";
    var possible = Object.keys(dict).join('');

    for (var i = 0; i < 100; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

function generateKey() {
    $('#keycontents').val(makeid());
}

//divides string into chunks/blocks
function chunkString(str, len) {
    var _size = Math.ceil(str.length / len),
        _ret = new Array(_size),
        _offset;

    for (var _i = 0; _i < _size; _i++) {
        _offset = _i * len;
        _ret[_i] = str.substring(_offset, _offset + len);
    }
    _ret[_ret.length - 1] = _ret[_ret.length - 1].padEnd(10, " ");

    return _ret;
}

//creates matrix out of string chunks
function stringArrayToMatrix(chunkedStringArray) {
    var matrix = new Array(chunkedStringArray.length);
    for (var i = 0; i < chunkedStringArray.length; i++) {
        var arrayItem = chunkedStringArray[i];
        var chunkArray = new Array(arrayItem.length);
        for (var j = 0; j < arrayItem.length; j++) {
            chunkArray[j] = dict[arrayItem[j].toLowerCase()];
        }
        matrix[i] = chunkArray;
    }
    return matrix;
}

//multiplies the matrix
function encode() {
    var plaintext = $('#contentToEncode').val();
    var key = $('#keycontents').val();

    var keyMatrix = stringArrayToMatrix(chunkString(key, 10));
    console.log(keyMatrix);
    var plainTextMatrix = stringArrayToMatrix(chunkString(plaintext, 10));

    var cypherText = new Array(plainTextMatrix.length);
    var modulo = Object.keys(dict).length;

    for (var i = 0; i < plainTextMatrix.length; i++) {
        var encodedBlock = math.multiply(keyMatrix, plainTextMatrix[i]);
        for (var j = 0; j < encodedBlock.length; j++) {
            for (var property in dict) {
                if (dict[property] === encodedBlock[j] % modulo) {
                    encodedBlock[j] = property;
                    break;
                }
            }
        }
        cypherText[i] = encodedBlock;
    }
    $('#contentToDecode').val(cypherText.flat().join(''));
}

function decode() {
    var cypherText = $('#contentToDecode').val();
    var key = $('#keycontents').val();

    //key matrix inverse with modulo

    //tu inverza neke nena prav zracuna wtf - ni navadni inverz ampak modulo inverz
    var keyMatrixInverse = math.mod(math.inv(stringArrayToMatrix(chunkString(key, 10))), 29);
    console.log(keyMatrixInverse);

    var cypherTextMatrix = stringArrayToMatrix(chunkString(cypherText, 10));

    var plaintext = new Array(cypherTextMatrix.length);
    var modulo = Object.keys(dict).length;
    //sffdsfsfs
    for (var i = 0; i < cypherTextMatrix.length; i++) {
        var decodedBlock = math.multiply(keyMatrixInverse, cypherTextMatrix[i]);
        for (var j = 0; j < decodedBlock.length; j++) {
            for (let property in dict) {
                if (dict[property] === decodedBlock[j] % modulo) {
                    decodedBlock[j] = property;
                    break;
                }
            }
        }
        plaintext[i] = decodedBlock;
    }
    $('#contentToEncode').val(plaintext.flat().join(''));
}

//open file logic
window.onload = function () {
    if (window.File && window.FileReader && window.FileList && window.Blob) {
        var plainText = document.getElementById('fileToEncode');
        plainText.addEventListener('change', function (e) {
            var fileExtension = /text.*/;
            var fileTobeRead = plainText.files[0];
            if (fileTobeRead.type.match(fileExtension)) {
                var fileReader = new FileReader();
                fileReader.onload = function (e) {
                    var fileContents = document.getElementById('contentToEncode');
                    fileContents.innerText = fileReader.result;
                };
                fileReader.readAsText(fileTobeRead);
            }
            else {
                alert("Please select text file");
            }

        }, false);

        var encodedText = document.getElementById('fileToDecode');
        encodedText.addEventListener('change', function (e) {
            var fileExtension = /text.*/;
            var fileTobeRead = encodedText.files[0];
            if (fileTobeRead.type.match(fileExtension)) {
                var fileReader = new FileReader();
                fileReader.onload = function (e) {
                    var fileContents = document.getElementById('contentToDecode');
                    fileContents.innerText = fileReader.result;
                };
                fileReader.readAsText(fileTobeRead);
            }
            else {
                alert("Please select text file");
            }

        }, false);
    }
    else {
        alert("Files are not supported");
    }
};