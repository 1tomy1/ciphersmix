var dict = {
    "a": 0, "b": 1, "c": 2, "č": 3, "d": 4, "e": 5, "f": 6, "g": 7, "h": 8, "i": 9,
    "j": 10, "k": 11, "l": 12, "m": 13, "n": 14, "o": 15, "p": 16, "r": 17, "s": 18,
    "š": 19, "t": 20, "u": 21, "v": 22, "z": 23, "ž": 24, ".": 25, ",": 26, "!": 27,
    " ": 28
};

//generates id where its matrix determinant has GCD 1 (for that reason prime number is chosen as modulus base),
//key matrix determinant != 0
function makeid(keysize) {
    let text = "";
    let possible = Object.keys(dict).join('');
    for (let i = 0; i < keysize; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    if (math.det(stringArrayToMatrix(chunkString(text, math.sqrt(keysize)))) === 0)
        return makeid(keysize);
    return text;
}

function generateKey() {
    $('#keycontents').val(makeid(math.pow($('#matrixBlockSizeInput').val(), 2)));
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
    _ret[_ret.length - 1] = _ret[_ret.length - 1].padEnd(len, " ");

    return _ret;
}

//creates matrix out of string chunks by mapping characters to corresponding number values
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

//encrypts the message by multiplying key matrix and message blocks
//performs mod operation on results
function encode() {
    var plaintext = $('#contentToEncode').val();
    var key = $('#keycontents').val();

    var keyMatrix = stringArrayToMatrix(chunkString(key, math.sqrt(key.length)));
    var plainTextMatrix = stringArrayToMatrix(chunkString(plaintext, math.sqrt(key.length)));

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

    var cypherTextMatrix = stringArrayToMatrix(chunkString(cypherText, math.sqrt(key.length)));

    //gets the inverse of key determinant mod base
    console.log(math.mod(math.floor(math.det(stringArrayToMatrix(chunkString(key, math.sqrt(key.length))))), Object.keys(dict).length));
    var keyDetModInverse = getGCD(math.mod(math.floor(math.det(stringArrayToMatrix(chunkString(key, math.sqrt(key.length))))), Object.keys(dict).length), Object.keys(dict).length);
    console.log(keyDetModInverse);

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

//extended Euclid Algorithm
//source: https://www.w3resource.com/javascript-exercises/javascript-math-exercise-47.php
function Euclid_gcd(a, b) {
    a = +a;
    b = +b;
    if (a !== a || b !== b) {
        return [NaN, NaN, NaN];
    }

    if (a === Infinity || a === -Infinity || b === Infinity || b === -Infinity) {
        return [Infinity, Infinity, Infinity];
    }
    // Checks if a or b are decimals
    if ((a % 1 !== 0) || (b % 1 !== 0)) {
        return false;
    }
    var signX = (a < 0) ? -1 : 1,
        signY = (b < 0) ? -1 : 1,
        x = 0,
        y = 1,
        u = 1,
        v = 0,
        q, r, m, n;
    a = Math.abs(a);
    b = Math.abs(b);

    while (a !== 0) {
        q = Math.floor(b / a);
        r = b % a;
        m = x - u * q;
        n = y - v * q;
        b = a;
        a = r;
        x = u;
        y = v;
        u = m;
        v = n;
    }
    return [b, signX * x, signY * y];
}

function getGCD(a,b) {
    return Euclid_gcd(a, b)[0];
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