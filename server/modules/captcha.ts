import sharp from "sharp";

function genMathFuck(mfk: string): string {
  function toHex(str: string): string {
    let result = "";
    for (let i = 0; i < str.length; i++) {
      result += str.charCodeAt(i).toString(16);
    }
    return result;
  }

  const translation: { [key: string]: string } = {
    "+": "O..",
    "-": "o..",
    "*": "Oo.",
    "/": "oO.",
    "^": "oOO",
    sqrt: "OoO",
    "=": "OOo",
    "(": "oo.",
    ")": "OO.",
  };
  const escapedKeys = Object.keys(translation).map((key) =>
    key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
  );
  const pattern = new RegExp(escapedKeys.join("|"), "g");
  const rvmfk = mfk.replaceAll(pattern, (match) => translation[match] || match);
  return toHex(rvmfk);
}

function translateMathFuck(mathFuckCode: string): string {
  const translation: { [key: string]: string } = {
    "O..": "+",
    "o..": "-",
    "Oo.": "×",
    "oO.": "/",
    oOO: "^",
    OoO: "√",
    OOo: "=",
    "oo.": "(",
    "OO.": ")",
  };
  const pattern = new RegExp(Object.keys(translation).join("|"), "g");
  return mathFuckCode.replaceAll(
    pattern,
    (match) => translation[match] || match,
  );
}

function evaluateMathFuck(mathFuckCode: string): number {
  if (!/^[0-9Oo.\-+*/^=()]+$/.test(mathFuckCode)) {
    console.error("Invalid input: Input contains invalid characters.");
    return NaN;
  }

  const translation: { [key: string]: string } = {
    "O..": "+",
    "o..": "-",
    "Oo.": "*",
    "oO.": "/",
    oOO: "^",
    OoO: "Math.sqrt",
    OOo: "=",
    "oo.": "(",
    "OO.": ")",
  };

  const pattern = new RegExp(Object.keys(translation).join("|"), "g");
  let translatedCode = mathFuckCode.replaceAll(
    pattern,
    (match) => translation[match] || match,
  );

  try {
    translatedCode = translatedCode.replace(/(\.0*|(?<=\d)0+)$/, "");
    let _: any = (() => {
      "use strict";
      return eval(translatedCode);
    })();
    return _;
  } catch (error) {
    console.error("Error during evaluation:", error);
    return NaN;
  }
}

async function makemfk_img(mfk: string, dense: number = 72): Promise<Buffer> {
  const readExp = translateMathFuck(mfk);
  let svg = Bun.file("captchabase.svg");
  let svgStr = await svg.text();
  const lines = svgStr.split("\n");
  lines[6] = `${readExp}`;
  svgStr = lines.join("\n");
  const gifBuffer = await sharp(Buffer.from(svgStr), { density: dense })
    .toFormat("gif")
    .toBuffer();
  return gifBuffer;
}

function makerandmfk() {
  var level: number = Math.floor(Math.random() * 5);
  var math: string = "";
  switch (level) {
    case 0:
      var choices = ["+", "*"];
      math = `${Math.floor(Math.random() * 9)}${choices[Math.floor(Math.random() * choices.length)]}${Math.floor(Math.random() * 9)}`;
      break;
    case 1:
      var choices = ["+", "-"];
      math = `${Math.floor(Math.random() * 127)}${choices[Math.floor(Math.random() * choices.length)]}${Math.floor(Math.random() * 5)}0`;
      break;
    case 2:
      var choices = [
        "12*12",
        "9*9",
        "(49+1)*(1/2)",
        "(99/3)/100",
        "(128*8)-1",
        "(2*3*2)*(2*3*2)",
      ];
      math = `${choices[Math.floor(Math.random() * choices.length)]}`;
      break;
    case 3:
      var choices = [
        "9+10",
        "21+17",
        "8*37",
        "1024/8",
        "65536*0.01",
        "(8^3)*2",
      ];
      math = `${choices[Math.floor(Math.random() * choices.length)]}`;
      break;
    case 4:
      var choices = [
        "sqrt(144)",
        "sqrt(16384)",
        "(sqrt(144))+25",
        "(sqrt(16384))*2",
      ];
      math = `${choices[Math.floor(Math.random() * choices.length)]}`;
      break;
    default:
      math = "11*(3*3)";
      break;
  }
  const translation: { [key: string]: string } = {
    "+": "O..",
    "-": "o..",
    "*": "Oo.",
    "/": "oO.",
    "^": "oOO",
    sqrt: "OoO",
    "=": "OOo",
    "(": "oo.",
    ")": "OO.",
  };
  const escapedKeys = Object.keys(translation).map((key) =>
    key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
  );
  const pattern = new RegExp(escapedKeys.join("|"), "g");
  const rvmfk = math.replaceAll(
    pattern,
    (match) => translation[match] || match,
  );
  return rvmfk;
}

// Exports

export default {
  mathfuck: {
    translate: translateMathFuck,
    img: makemfk_img,
    random: makerandmfk,
    gen: genMathFuck,
    eval: evaluateMathFuck,
  },
};
