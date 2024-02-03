import sharp from 'sharp';
function translateMathFuck(mathFuckCode: string): string {
    const translation: {[key: string]: string} = {
        'ඞ?': '+',
        'ඞ.': '-',
        'ඞ-': '×',  
        'ඞ;': '/',
        'ඞ!': '^',
        'ඞ=': '√',
        'ඞ#': '=',
        '_ඞ': '(',
        'ඞ_': ')'
    };
    return mathFuckCode.replaceAll(/ඞ[?.;!=#_-]|_ඞ/g, match => translation[match] || match);
}

function shift(inputString: string, flipbit: number = 1) {
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


export default {
    mathfuck:{translate:translateMathFuck,img:makemfk_img,shift:shift}
}