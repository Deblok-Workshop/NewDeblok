import sharp from 'sharp';

function genMathFuck(mfk: string): string {
    function toHex(str: string): string {
        let result = '';
        for (let i = 0; i < str.length; i++) {
            result += str.charCodeAt(i).toString(16);
        }
        return result;
    }

    const translation: {[key: string]: string} = {
        '+': 'O..',
        '-': 'o..',
        '*': 'Oo.',
        '/': 'oO.',
        '^': 'oOO',
        'sqrt': 'OoO',
        '=': 'OOo',
        '(': 'oo.',
        ')': 'OO.'
    };
    const pattern = new RegExp(Object.keys(translation).join('|'), 'g');
    const rvmfk = mfk.replaceAll(pattern, match => translation[match] || match);
    return toHex(rvmfk);
}


function translateMathFuck(mathFuckCode: string): string {
    const translation: {[key: string]: string} = {
        'O..': '+',
        'o..': '-',
        'Oo.': '×',  
        'oO.': '/',
        'oOO': '^',
        'OoO': '√',
        'OOo': '=',
        'oo.': '(',
        'OO.': ')'
    };
    const pattern = new RegExp(Object.keys(translation).join('|'), 'g');
    return mathFuckCode.replaceAll(pattern, match => translation[match] || match);
}

function shift(inputString: string, flipbit: number = 1) {
    /* 
     @deprecated 
     */
    let shiftedString = '';
    if (flipbit == -1 || flipbit == 1) {} else {flipbit = 1}
    for (let i = 0; i < inputString.length; i++) {
        const codePoint = inputString.charCodeAt(i);
        const shiftedCodePoint = codePoint + (54*flipbit);
        shiftedString += String.fromCharCode(shiftedCodePoint);
    }
    
    return shiftedString;
}


async function makemfk_img(mfk: string,dense: number = 72): Promise<Buffer> {
    const readExp = translateMathFuck(mfk);
    let svg = Bun.file('captchabase.svg')
    let svgStr = await svg.text();
    const lines = svgStr.split('\n');
    lines[6] = `${readExp}`;
    svgStr = lines.join('\n');
    const gifBuffer = await sharp(Buffer.from(svgStr), { density: dense })
        .toFormat('gif')
        .toBuffer();
    return gifBuffer;
}

function makerandmfk() {
    var level:number = Math.floor(Math.random()*4)
    var math :string = "";
    switch (level) {
        case 0:
            var choices = ['+','*']
            math = `${Math.floor(Math.random()*9)}${choices[Math.floor(Math.random()*choices.length)]}${Math.floor(Math.random()*9)}`
            break;
        case 1:
            var choices = ['+','*','-']
            math = `${Math.floor(Math.random()*127)}${choices[Math.floor(Math.random()*choices.length)]}${Math.floor(Math.random()*5)}0`
            break;
        case 2:
            var choices = ['12*(3*4)','9*(3*3)','((7^2)+1)*(1/2)','((9*11)/3)*(1/100)',"((8*8)*(128*8))-1","(2*3*2)*(2*3*2)"]
            math = `${choices[Math.floor(Math.random()*choices.length)]}`
            break;
        case 3:
            var choices = ['9+10','21+17','8*37','1024/8','65536*0.01','(8^3)*2']
            math = `${choices[Math.floor(Math.random()*choices.length)]}`
            break;
    
        default:
            math = '1+1'
            break;
    }
    const translation: {[key: string]: string} = {
        '+': 'O..',
        '-': 'o..',
        '*': 'Oo.',
        '/': 'oO.',
        '^': 'oOO',
        'sqrt': 'OoO',
        '=': 'OOo',
        '(': 'oo.',
        ')': 'OO.'
    };
    const pattern = new RegExp(Object.keys(translation).join('|'), 'g');
    const rvmfk = math.replaceAll(pattern, match => translation[match] || match);
    return rvmfk;
    
}

export default {
    mathfuck:{translate:translateMathFuck,img:makemfk_img,shift:shift,random:makerandmfk,gen:genMathFuck}
}