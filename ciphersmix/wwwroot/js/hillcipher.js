$(document).ready(() => {
    $('#supportedCharacters').html(Object.keys(dict));
});

var dict = {
    "a": 0, "b": 1, "c": 2, "d": 3, "e": 4, "f": 5, "g": 6, "h": 7, "i": 8, "j": 9,
    "k": 10, "l": 11, "m": 12, "n": 13, "o": 14, "p": 15, "q": 16, "r": 17, "s": 18,
    "t": 19, "u": 20, "v": 21, "x": 22, "w": 23, "y": 24, "z": 25, ".": 26, "!": 27,
    ",": 28, "?": 29, " ": 30, "1": 31, "2": 32, "3": 33, "4": 34, "5": 35, "6": 36,
    "7": 37, "8": 38, "9": 39, "0": 40, ":": 41, ";": 42
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
    var modBase = Object.keys(dict).length;

    for (var i = 0; i < plainTextMatrix.length; i++) {
        var encodedBlock = math.multiply(keyMatrix, plainTextMatrix[i]);
        for (var j = 0; j < encodedBlock.length; j++) {
            for (var property in dict) {
                if (dict[property] === encodedBlock[j] % modBase) {
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
    var keyMatrix = stringArrayToMatrix(chunkString(key, math.sqrt(key.length)));
    var cypherTextMatrix = stringArrayToMatrix(chunkString(cypherText, math.sqrt(key.length)));

    //step 1: modular multiplicative inverse of key matrix determinant mod base
    var modBase = Object.keys(dict).length;
    var keyMatrixDeterminant = math.mod(math.ceil(math.det(keyMatrix)), Object.keys(dict).length);
    var keyDetModInverse = modInverse(keyMatrixDeterminant, modBase);

    //step 2: find matrix of cofactors
    let cofactorMatrix = lightmatrix.cofactors(keyMatrix);

    //step 3: key matrix transposition
    let transposed = math.transpose(cofactorMatrix);

    //step 5: key matrix multiplication by mod inverse and mod operation
    let multiplied = math.multiply(keyDetModInverse, transposed);

    //step 6: get mod value of each matrix cell
    let invMatrix = math.mod(multiplied, modBase);

    //step 7: Calculate plaintext
    var plaintext = new Array(cypherTextMatrix.length);
    for (var i = 0; i < cypherTextMatrix.length; i++) {
        var decodedBlock = math.multiply(invMatrix, cypherTextMatrix[i]);
        for (var j = 0; j < decodedBlock.length; j++) {
            for (let property in dict) {
                if (dict[property] === decodedBlock[j] % modBase) {
                    decodedBlock[j] = property;
                    break;
                }
            }
        }
        plaintext[i] = decodedBlock;
    }
    $('#contentToEncode').val(plaintext.flat().join(''));
}

//Finds inverse of a mod m
//Source: Dipu - https://stackoverflow.com/questions/26985808/calculating-the-modular-inverse-in-javascript
function modInverse(a, m) {
    // validate inputs
    [a, m] = [Number(a), Number(m)];
    if (Number.isNaN(a) || Number.isNaN(m)) {
        return NaN; // invalid input
    }
    a = (a % m + m) % m;
    if (!a || m < 2) {
        return NaN // invalid input
    }
    // find the gcd
    const s = [];
    let b = m;
    while (b) {
        [a, b] = [b, a % b];
        s.push({ a, b });
    }
    if (a !== 1) {
        return NaN; // inverse does not exists
    }
    // find the inverse
    let x = 1;
    let y = 0;
    for (let i = s.length - 2; i >= 0; --i) {
        [x, y] = [y, x - y * Math.floor(s[i].a / s[i].b)];
    }
    return (y % m + m) % m;
}

//open file logic
//window.onload = function () {
//    if (window.File && window.FileReader && window.FileList && window.Blob) {
//        var plainText = document.getElementById('fileToEncode');
//        plainText.addEventListener('change', function (e) {
//            var fileExtension = /text.*/;
//            var fileTobeRead = plainText.files[0];
//            if (fileTobeRead.type.match(fileExtension)) {
//                var fileReader = new FileReader();
//                fileReader.onload = function (e) {
//                    var fileContents = document.getElementById('contentToEncode');
//                    fileContents.innerText = fileReader.result;
//                };
//                fileReader.readAsText(fileTobeRead);
//            }
//            else {
//                alert("Please select text file");
//            }

//        }, false);

//        var encodedText = document.getElementById('fileToDecode');
//        encodedText.addEventListener('change', function (e) {
//            var fileExtension = /text.*/;
//            var fileTobeRead = encodedText.files[0];
//            if (fileTobeRead.type.match(fileExtension)) {
//                var fileReader = new FileReader();
//                fileReader.onload = function (e) {
//                    var fileContents = document.getElementById('contentToDecode');
//                    fileContents.innerText = fileReader.result;
//                };
//                fileReader.readAsText(fileTobeRead);
//            }
//            else {
//                alert("Please select text file");
//            }

//        }, false);
//    }
//    else {
//        alert("Files are not supported");
//    }
//};